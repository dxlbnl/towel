

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


class JsonSignal(Signal):
    @JSVar('xhr')
    def __init__(self, identifier):
        
        def change():
            print xhr.readyState
            if py(xhr.readyState) == 4:
                print "done:", py(xhr.response)
                
        
        xhr = create_xml_httprequest()
        xhr.onreadystatechange = change
        
        self.xhr = xhr
        self.identifier = identifier
        
    @JSVar('xhr')
    def __call__(self, *args, **kwargs):
        data = {
            'identifier' : self.identifier,
            'args'       : args,
            'kwargs'     : kwargs
        }
        jsondata = json.dumps(data)
        print jsondata
        xhr = js(self.xhr)
        xhr.open("POST", "/ajax", True)
        xhr.send(jsondata)