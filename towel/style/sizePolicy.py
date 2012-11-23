

class SizePolicy(object):
    
    expanding = ''
    fixed = ''

    x = 'x'
    y = 'y'

    def __init__(self, widget, x, y):
        self.x = x
        self.y = y
        
        self.widget = widget
    
    def set_size(self, x, y):
        self.x = x
        self.y = y

        # self.widget.sheet.set_rule("#" + self.widget.id, {})
        if hasattr(self, 'divide_space'):
            self.divide_space()

    def divide(self, policies, direction):
        print "Dividing over", policies, direction
        divided = getattr(self, direction) / len(policies)
        return [divided] * len(policies)
