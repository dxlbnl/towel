import json
import os.path

import tornado.ioloop
import tornado.web
from tornado.autoreload import watch

from dependence import makeDependencyTree

print "###################### Starting server ######################\n"

html_template = """
<!doctype html>
<meta charset=utf-8>

<script src=/static/ajax.js></script>
<script src=/static/py-builtins.js></script>
<script>

var JsonHttpRequest = function () {{
    return new XMLHttpRequest();
}};

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
            
            print 'hier', mod
            if mod:        
                self.write(mod.compile())
        else:
            if mod:        
                self.write(mod.code)
            
    
    @classmethod
    def addApplication(cls, app):
        print "Added application", app
        
        dependencies = makeDependencyTree(app, watch=watch)
        
        ScriptServer.apps[app] = dependencies
        ScriptServer.modules.update(dependencies) 
        
class JSONHandler(tornado.web.RequestHandler):
    # applications can post a json request
    
    servers = {}
    
    def post(self, server):
        print json.loads(self.request.body)
        self.write("test")
        
    @classmethod
    def addJSONServer(name, server):
        JSONHandler.servers[name] = server
        
    
settings = {
    "static_path"   : os.path.join(os.path.dirname(__file__), "static"),
    "debug"         : True
}
        
application = tornado.web.Application([
    (r"/import/([\w.]+)", ScriptServer),
    (r"/ajax", JSONHandler),
    (r"/(\w*)", MainHandler),
], **settings)


def add_application(application):
    print "adding application:", application
    ScriptServer.addApplication(application)
    
    
def add_server(name, server):
    print "adding application:", application
    JSONHandler.addJSONServer(name, server)
    
def start_server(port=8888, address='127.0.0.1'):
    application.listen(port, address)
    tornado.ioloop.IOLoop.instance().start()