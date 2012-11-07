from towel.templates import Widget, DOMNode 
from towel.communication import Signal


class LineEdit(Widget):
    directive = {
        '@class' : 'name',
        "@placeholder" : "default",
        "@disabled" : "disabled",
        "@value" : "value"
    }
    
    template  = DOMNode("input", {"type":"text"})
    
    def __init__(self, default=""):
        super(LineEdit, self).__init__()
        
        self.name = 'blla'
        
        self.valueChanged = Signal()
        self.textEntered = Signal()
        self.sortNow = Signal()
        
        #self.track(":keyup", self.__keypressed)
        self.track(":keypress", self.__keypressed)
        
        self.default = default
        self.value = ''
        
    @JSVar('e')
    def __keypressed(self, e):
        
        ev_type = py(e.type)
        keyCode = py(e.which)
        value = py(e.target.value)
        
        ctrl  = py(e.ctrlKey)
        alt  = py(e.altKey)
        
        if ev_type == "keypress":
            code = py(e.keyCode)
            value += chr(code)
            
        if keyCode == 13:
            self.textEntered(value)
            
        if self.value != value and self.valueChanged.listening():
            self.valueChanged(value)
        
        


    def clear(self):
        self.setValue('')
        
    def setValue(self, value):
        self.value = value
        
        
        