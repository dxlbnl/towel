from towel import templates

class BaseSetter(object):
    def set(self, data): raise NotImplementedError()
    def merge(self, setter): raise NotImplementedError()

class Setter(BaseSetter):
    
    def __init__(self, nodes, attr=''):
        self.setters = []
        
        for node in nodes:
            self.setters.append((node, attr))
            
    def set(self, data):
        for setter in self.setters:
            if setter[1]:                
                setter[0].setAttribute(setter[1], data)
            else:
                if isinstance(data, templates.Widget) and isinstance(data.node, templates.DOMNode):
                    setter[0].setChild(data.node)
                else:
                    setter[0].setText(data)
            
    def merge(self, setter):
        self.setters += setter.setters
        