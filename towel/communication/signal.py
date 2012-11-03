

class Signal(object):
    def __init__(self):
        self.connected = []
        
    def __call__(self, *args, **kwargs):
        for func in self.connected:
            func(*args, **kwargs)
        
    def connect(self, func):
        self.connected.append(func)
        
    def listening(self):
        #returns true if a method connected
        if self.connected:
            return True
 
