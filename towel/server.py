import json
import os.path

from towel import configuration
from datetime import datetime

import tornado.ioloop
import tornado.web
import tornado.websocket
from tornado.autoreload import watch

from dependence import makeDependencyTree

print "###################### Starting server ######################\n"

html_template = """
<!doctype html>
<meta charset=utf-8>

<link href='/static/style.css' rel='stylesheet'></link>
<link href='/static/reset.css' rel='stylesheet'></link>

<script src=/static/ajax.js></script>
<script src=/static/py-builtins.js></script>
<script>

function JsonHttpRequest() {{
    return new XMLHttpRequest();
}};

function create_web_socket(url) {{
    return new WebSocket("ws://" + url);;
}}



$PY.load_lazy = function (module) {{
    //console.log("Loading module", module);
    var xhReq = new XMLHttpRequest();
    xhReq.open("GET", "/import/"+module, false);
    xhReq.send(null);
    var serverResponse = xhReq.responseText;
        
    var el = document.createElement('script');
    el.textContent = serverResponse;
    document.head.appendChild(el);
    
}};
</script>
{scripts}

<script src=/import/{main}></script>
"""

class MainHandler(tornado.web.RequestHandler):
    def get(self, app):
        # if app is not defined, it returns a list of applications
        if app:
            s = []
            for m in ScriptServer.apps[app].values():
                if m.fullname != "__main__":
                    s.extend(m.getModules())
                
            scripts = '\n'.join(["<script src=/import/{}></script>".format(m.fullname)
                            for m in s])
            
            self.write( html_template.format(main=app, scripts=scripts) )
        else:
            self.write("<!doctype html><meta charset=utf-8><ul>{apps}</ul>".format(
                        apps = '\n'.join(["<li><a href={app}>{app}</a></li>".format(app=app) for app in ScriptServer.apps.keys()])
            ))
        
class ScriptServer(tornado.web.RequestHandler):
    
    modules = {}
    apps    = {}
    
    def get(self, module):
        lang = self.get_argument('lang', 'javascript')
        if '.' in module:
            root, rest = module.split('.', 1)
        else:
            root, rest = module, None
        
        mod = self.modules.get(root, None)
        if mod and rest:
            mod = mod.search(rest)
        
        self.set_header("Content-Type", "application/javascript")
        
        if lang == "javascript":
            if mod:        
                self.write(mod.compile())
        else:
            if mod:        
                self.write(mod.code)
            
    
    @classmethod
    def addApplication(cls, app):
        print "++++++++++++++++   Adding application", app
        
        dependencies = makeDependencyTree(app, watch=watch)
        
        ScriptServer.apps[app] = dependencies
        ScriptServer.modules.update(dependencies) 
        
class JSONHandler(tornado.web.RequestHandler):
    # applications can post a json request
    
    servers = {}
    
    def post(self, server):
        data = json.loads(self.request.body)
        if server in self.servers:
            res = self.servers[server](*data['args'], **data['kwargs'])
            self.write(json.dumps(res))
        
        
    @classmethod
    def addJSONServer(cls, name, server):
        cls.servers[name] = server

        
class LazyCaller(object):
    """a lazycaller doesnt have any defined functions, instead it will package the function call"""
    
    def __init__(self, callback, uuid):
        self.callback = callback
        self.uuid = uuid
        
        
    def __getattr__(self, name):
        def stub_function(*args, **kwargs):
            print "<--", args, kwargs
            self.callback(
                dict(
                    uuid   = self.uuid,
                    name   = name,
                    args   = args,
                    kwargs = kwargs
                )
            )
            
        return stub_function
        

class ClientCaller(object):
    def __init__(self, socket, uuid):
        self.socket = socket
        self.uuid = uuid
        
        # caller helpers
        self.all = LazyCaller(self.socket.call_all, self.uuid)
        self.one = LazyCaller(self.socket.call_one, self.uuid)
        
        
class Client(tornado.websocket.WebSocketHandler):
    """The client object dispatches messages to connected functions and keeps state"""
    connections = []
    handlers = {}

    def open(self):
        self.connections.append(self)
        self.signals = {}
        
        print 'new connection'

    def serialize(self, data):
        dthandler = lambda obj: obj.isoformat() if isinstance(obj, datetime) else None
        return json.dumps(data, default=dthandler)
        
    def call_all(self, data):
        for conn in self.connections:
            conn.write_message(self.serialize(data))
            
    def call_one(self, data):
        self.write_message(self.serialize(data))
    
    def on_message(self, message):
        """The dispatcher"""
        data = json.loads(message)
        print "-->:", [data]
        type = data['type']
        
        if type == 'create':
            handler = data['handler']
            uuid    = data['uuid']
            if handler in self.handlers:
                clientcaller = ClientCaller(self, uuid)
                instance =self.handlers[handler](clientcaller)
                self.signals[uuid] = instance
            else:
                print "did not find identifier"
                
            print 
        elif type == 'call':
            name = data['name']
            uuid = data['uuid']
            if uuid in self.signals:
                f = getattr(self.signals[uuid], name, None)
                if f:
                    f(*data['args'], **data['kwargs'])
                else:
                    print "did not find signal", uuid, name
            else:
                print "did not find uuid", uuid
                
    def on_close(self):
        self.connections.remove(self)
        for signal in self.signals:
            self.signals[signal].detach()
        print 'connection closed'
    
        
    @classmethod
    def addHandler(cls, server):
        cls.handlers[server.__name__] = server
    
settings = {
    "static_path"   : os.path.join(os.path.dirname(__file__), "static"),
    "debug"         : True
}
        
application = tornado.web.Application([
    (r"/import/([\w.]+)", ScriptServer),
    (r"/ajax/([\w]+)", JSONHandler),
    (r"/ws", Client),
    (r"/([\w.]*)", MainHandler),
], **settings)


def add_application(application):
    print "adding application:", application
    ScriptServer.addApplication(application)
    
    
def add_server(server):
    print "adding application:", application
    Client.addHandler(server)
    
def start_server(port=configuration.port, address=configuration.localhost):
    application.listen(port, address)
    tornado.ioloop.IOLoop.instance().start()
