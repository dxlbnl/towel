from towel.templates import Widget, DOMNode

class View(Widget):
    
    def setModel(self, model):
        self.model = model
        self.model.setView(self)
        
        

class ListView(View):
    
    def __init__(self):
        super(ListView, self).__init__()
        self.items = []
        
    def addItem(self, item):
        self.items.append(item);
        
    def sort(self):
        self.items.sort()

    def replace(self, items):
        while self.items:
            self.items.pop()
        for i in items:
            self.items.append(i)
    
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
    
    
