from Templates import Widget, DOMNode

class Menu(Widget):
    directive = {
        '@class' : 'name',
        'li' : {
            'item<-items' : {
                '.' : 'item'
            }
        }
    }
    
    template = DOMNode("ul", {'class':'menu'}, children=[
        DOMNode('li')
    ])
    
    def __init__(self, items = []):
        super(Menu, self).__init__()
        
        self.items = items
        
    def addMenuItem(self, item):
        self.items.append(item)
        
    def setHorizontal(self):
        self.node.addClass("horizontal")