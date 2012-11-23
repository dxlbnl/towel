print "loading Templates.widget"

from towel.templates.compiler import compileDirective
from towel.style import Sheet, SizePolicy

class Widget(object):
    """A Widget is a visible ui component, it can contain other widgets"""
    
    id = 0
    
    directive = None
    template  = None
    __setters__ = {}
    
    # layout
    sheet = Sheet("style")
    
    def __init__(self):
        self.node = self.template.clone()
        self.__setters__ = compileDirective(self.directive, [self.node])
        self.name = self.__name__
        
        self.id = self.name + str(Widget.id)
        Widget.id += 1
        
        self.size_policy = SizePolicy(self, 
            x = SizePolicy.expanding, 
            y = SizePolicy.expanding
        )

        if hasattr(self, 'style'):
            self.sheet.set_rule("#" + self.id, self.style)
        

    def track(self, event, callback):
        """Tracks the linked value name on changes, updates the value when the value changes in the dom."""
        
        selector, event = ':' in event and event.split(':') or [event, '']
        print "Tracking", event
        
        targets = self.node.query(selector)
        
        for target in targets:
            target.addEvent(event, callback)

    def __setattr__(self, name, value):
        #print "Setting", [name, value]
        if name in self.__setters__:
            if isinstance(self.__setters__[name], list):
                object.__setattr__(self, name, self.__setters__[name])
            else:
                object.__setattr__(self, name, value)
            self.__setters__[name].set(value)
        else:
            object.__setattr__(self, name, value)

    @JSVar("window")
    def setRoot(self):
        self.node.setRoot()
        
        def resize(e):
            self.__on_resize(e)
        
        window.addEventListener('resize', resize, false)
        self.__on_resize()
        
    @JSVar('document')
    def __on_resize(self):
        x = py(document.body.offsetWidth)
        y = py(document.body.offsetHeight)
        
        if self.size_policy:
            self.size_policy.set_size(x, y)
        else:
            print "No size policy available"
