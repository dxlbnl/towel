class Model(object):
    
    def __init__(self):
        self.items = []
        self.views = []
    
    def addItem(self, item):
        self.items.append(item)
        self.notifyViews(addI
        print "Added item", item
        
    def setView(self, view):
        self.views.append(view) 
