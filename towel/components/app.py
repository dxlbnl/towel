from towel.templates import Widget, DOMNode

class App(Widget):
        
    directive = {'.' : 'layout', '@class' : 'name'}
    template = DOMNode('div')
    
    def __init__(self):
        super(App, self).__init__()