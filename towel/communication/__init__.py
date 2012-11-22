

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

Connection = ''    
        
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
        #print "<--", data
        instance = Connection.websignals[data['uuid']]
        instance.call(data['name'], *data['args'], **data['kwargs'])

    def on_open(self, func):
        print 'opened ws'
        self.state = 'open'
        if self.cache:
            for data in self.cache:
                self.send(data)

    def on_close(self, func):
        print 'closed ws', func
        self.state = 'close'
        #self.connect()

    @JSVar("ws")
    def send(self, data):
        if self.state == 'open':
            #print "-->", data
            data = json.dumps(data)
            ws = js(self.ws)
            ws.send(data)
        else:
            self.cache.append(data)

def create_dummy_callable(send, uuid, name):
    def dummy_callable(*args, **kwargs):
        send(dict(
            type='call',
            uuid = uuid,
            name = name,
            args = args, 
            kwargs = kwargs
        ))
    return dummy_callable
        
class Connection(Signal):
    websignals = {}
    
    knownUuids = []
    
    def __init__(self, handler, obj):
        super(Connection, self).__init__()
        self.obj = obj
        self.uuid = self.create_uuid(handler)
        self.websignals[self.uuid] = self
        self.send(dict(
            type = 'create',
            handler = handler,
            uuid = self.uuid
        ))
        
    def create_uuid(self, handler):
        i = 0
        while True:
            h = "%s-%d" %(handler, i)
            if h not in self.knownUuids:
                self.knownUuids.append(h)
                return h
            i += 1
    
    def __getattr__(self, name):
        return create_dummy_callable(self.send, self.uuid, name)
        
    def call(self, name, *args, **kwargs):
        self.obj.__getattribute__(name)(*args, **kwargs)


ws = WebSocket(configuration.host + "/ws")
Connection.send = ws.send
