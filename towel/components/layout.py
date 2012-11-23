from towel.templates import Widget, DOMNode
from towel.style import SizePolicy

class Layout(Widget):
    directive = {
        '@id' : 'id',
        '@class' : 'name',
        'div' : {
            "child<-children" : {
                "." : 'child'
            }
        }
    }
    template  = DOMNode('div', children=[
        DOMNode('div')
    ])
    
    
    def __init__(self, *args):
        super(Layout, self).__init__()
        
        self.children = list(args)

        self.size_policy.divide_size = self.divide_size
        
    def add(self, child):
        self.children.append(child)
        
    
class HLayout(Layout):

    def divide_size(self, x, y):
        child_size = x / len(self.children)

        for child in self.children:
            child.size_policy.set_size(child_size, y)
            
class VLayout(Layout):

    def divide_size(self, x, y):
        child_size = y / len(self.children)

        for child in self.children:
            child.size_policy.set_size(x, child_size)
            
            
            
            
            
            
            
