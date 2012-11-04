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
        
        self.track(":keyup", self.__keypressed)
        self.track(":keypress", self.__keypressed)
        self.track(":keydown", self.__keypressed)
        
        self.default = default
        self.value = ''
        
    @JSVar('e')
    def __keypressed(self, e):
        code = py(e.charCode)
        value = py(e.target.value)
        ctrl  = py(e.ctrlKey)
        alt  = py(e.altKey)
        keyCode = py(e.which)
        
        print "key pressed", value, keyCode
        
        if code == 13:
            print 1
            if self.textEntered.listening():
                self.value = ""
                self.textEntered(value)
        else:
            print 2
            if self.value != value and self.valueChanged.listening():
                self.valueChanged(value)
                
            if ctrl and keyCode == 2:
                
                self.sortNow()
                
            self.value = value

    def clear(self):
        print 'clearing'
        self.setValue('')
        
    def setValue(self, value):
        self.value = value
        
        
        