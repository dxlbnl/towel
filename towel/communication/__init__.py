

from towel.communication.signal import Signal 
from towel import configuration

@JSVar('JSON')
def json_dumps(obj):
    return JSON.stringify(js(obj))
    
@JSVar('JSON')
def json_loads(string):
    return JSON.parse(js(string))

json = object()
json.dumps = json_dumps
json.loads = json_loads


#class JsonSignal(Signal):
    #@JSVar('xhr', 'JSON')
    #def __init__(self, identifier):
        #super(JsonSignal, self).__init__()
        
        #def change():
            #if py(xhr.readyState) == 4:
                #print "done:", py(xhr.response)
                
                #super(JsonSignal, self).__call__(xhr.response)
                
        
        #xhr = create_xml_httprequest()
        #xhr.onreadystatechange = change
        
        #self.xhr = xhr
        #self.identifier = identifier
        
    #@JSVar('xhr')
    #def __call__(self, *args, **kwargs):
        #super(JsonSignal, self).__call__(*args, **kwargs)
        #data = {
            #'args'       : args,
            #'kwargs'     : kwargs
        #}
        #jsondata = json.dumps(data)
        #url = "/ajax/" + self.identifier
        
        #print jsondata
        
        #xhr = js(self.xhr)
        #xhr.open("POST", url, True)
        #xhr.send(jsondata)
        

    #ws.onmessage = function(evt) {{alert("message received: " + evt.data)}};
 
    #ws.onclose = function(evt) {{ alert("Connection close"); }};
 
    #ws.onopen = function(evt) {{ 
        #console.log("websocked: " + url + " opened");
    #}};
JsonSignal = ''    
        
class WebSocket(object):
    def __init__(self, url):
        self.url = url
        self.cache = []

        self.connect()

    @JSVar("ws")
    def connect(self):
        ws = js(create_web_socket(self.url))
        ws.onmessage = js(self.on_message)
        ws.onopen    = js(self.on_open)
        ws.onclose   = js(self.on_close)
        self.state = 'close'
        self.ws = ws
        

    @JSVar("res")
    def on_message(self, res):
        data = py(json.loads(res.data))
        instance = JsonSignal.websignals[data['identifier']]
        parent_cls = super(JsonSignal, instance)
        parent_cls.__call__(*data['args'], **data['kwargs']) 

    def on_open(self, func):
        print 'opened ws'
        self.state = 'open'
        if self.cache:
            for data in self.cache:
                self.send(data)

    def on_close(self, func):
        print 'closed ws'
        self.state = 'close'
        #self.connect()

    @JSVar("ws")
    def send(self, data):
        if self.state == 'open':
            ws = js(self.ws)
            ws.send(data)
        else:
            self.cache.append(data)
        

def create_dummy_callable(send, handler, name):
    def dummy_callable(*args, **kwargs):
        send(json.dumps(dict(
            type='call',
            handler = handler,
            name = name,
            args = args, 
            kwargs = kwargs
        )))
    
        
class JsonSignal(Signal):
    websignals = {}
    
    def __init__(self, handler):
        super(JsonSignal, self).__init__()
        
        self.handler = handler
        self.websignals[handler] = self
        self.send(json.dumps(dict(
            type = 'create',
            handler = handler
        )))
        
        
        
    def __getattr__(self, name):
        orig = super(JsonSignal, self).__getattr__(name)
        print "Got orig:",orig, name
        if orig != None:
            return create_dummy_callable(self.send, self.handler, name)
        return orig
        
    def __call__(self, *args, **kwargs):
        data = {
            'handler' : self.handler,
            'type'       : 'call',
            'args'       : args,
            'kwargs'     : kwargs
        }
        jsondata = json.dumps(data)
        
        print jsondata
        self.send(jsondata)


ws = WebSocket(configuration.host + "/ws")
JsonSignal.send = ws.send
