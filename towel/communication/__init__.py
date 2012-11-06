

from towel.communication.signal import Signal 

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
    
        
        
class JsonSignal(Signal):
    @JSVar('ws')
    def __init__(self, identifier):
        super(JsonSignal, self).__init__()
        
        ws = create_web_socket("dev.towel.dxtr.be/ws")
        
        ws.onmessage = js(self.on_message)
        ws.onclose = js(self.on_close)
        ws.onopen = js(self.on_open)
        
        self.ws = ws
        self.identifier = identifier
        
    @JSVar('res')
    def on_message(self, res):
        print "Received message:", res
        data = py(json.loads(res.data))
        super(JsonSignal, self).__call__(*data['args'], **data['kwargs'])
        
    def on_open(self):
        print "Websocket connection opened"
        
    @JSVar('window')
    def on_close(self):
        #window.location = window.location
        print "Websocket connection closed"
        
    @JSVar('ws')
    def __call__(self, *args, **kwargs):
        data = {
            'identifier' : self.identifier,
            'args'       : args,
            'kwargs'     : kwargs
        }
        jsondata = json.dumps(data)
        
        print jsondata
        
        ws = js(self.ws)
        ws.send(jsondata)
