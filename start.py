from towel import server

class Signal(object):

    def __init__(self, identifier, handler):
        self.identifier = identifier
        self.handler = handler
        self.callbacks = []

    def attach(self, func):
        self.callbacks.append(func)
        
    def all(self, *args, **kwargs):
        print "returning:", self.identifier, args, kwargs
        self.handler.all(self.identifier, *args, **kwargs)
    
    def __call__(self, *args, **kwargs):
        self.all(*args, **kwargs)
        print "Calling func with", args, kwargs

    def detach(self):
        pass

class LineAdded(Signal):
    pass

    
class NameChanged(Signal):
    names = []

    def __init__(self, identifier, handler):
        super(NameChanged, self).__init__(identifier, handler)
        self.name = None

    def __call__(self, name):
        if self.name:
            self.names.remove(self.name)
        self.name = name
        self.names.append(name)
        self.names.sort()
        self.all(self.names)

    def detach(self):
        self.names.remove(self.name)
        self.all(self.names)



server.add_application("test")
server.add_server("lineAdded", LineAdded)
server.add_server("nameChanged", NameChanged)
#server.add_application("chat")
#server.add_application("json_test")
server.start_server();
