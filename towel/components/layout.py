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

        self.size_policy.divide_space = self.divide_space
        
    def add(self, child):
        self.children.append(child)
        
    
class HLayout(Layout):

    def divide_space(self):
        """Passes the sizepolicies to sizepolicy to share the size available."""

        policies = []
        for child in self.children:
            policies.append(child.size_policy)

        self.size_policy.divide(policies, direction=SizePolicy.x)
            
class VLayout(Layout):

    def divide_space(self):
        """Passes the sizepolicies to sizepolicy to share the size available."""

        policies = []
        for child in self.children:
            policies.append(child.size_policy)

        print self.size_policy.divide(policies, direction=SizePolicy.x)
            
            
            
            
            
            
            
