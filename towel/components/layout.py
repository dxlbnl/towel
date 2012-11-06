from towel.templates import Widget, DOMNode


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
##        self.sizePolicy = SizePolicy(self, 
##            x = SizePolicy.expanding, 
##            y = SizePolicy.expanding
##        )
        
    def setSize(self, x=None, y=None):
        #self.sizePolicy.setSize(x, y)
        print 'setting size of layout:', x, y
        
    def addChild(self, child):
        self.children.append(child)
        
        
    
    
class HLayout(Layout):
    style = {
        'background' : 'red'
    }
    #def setSize(self, x, y):
        #Widget.setSize(self, x, y)
        #for child in self.node.children():
            #child.setSize(x / len(self.children), y)
            
class VLayout(Layout):
    pass
    #def setSize(self, x, y):
        #Widget.setSize(self, x, y)
        #for child in self.node.children():
            #child.setSize(x, y/ len(self.children))
            
            
            
            
            
            
            
            
