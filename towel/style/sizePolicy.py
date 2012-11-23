

class SizePolicy(object):
    
    expanding = ''
    fixed = ''
    
    def __init__(self, widget, x, y):
        self.x = x
        self.y = y
        
        self.widget = widget
    
    def set_size(self, x, y):
        self.widget.sheet.set_rule("#" + self.widget.id, {
            'width'  : str(x) + 'px',
            'height' : str(y) + 'px',
            'float'  : 'left',
        })
        if hasattr(self, 'divide_size'):
            self.divide_size(x, y)
        
        
        #if isinstance(x, int):
            #print self.obj
            #self.sheet.setRule("#" + str(self.obj.id), {
                #'width' : str(x) + 'px', 
                #'position' : 'absolute', 
                #'left' : '50%', 
                #'margin-left' : str(-(x/2)) + 'px'
            #})
            #self.xPolicy = x 
        
        #if y:
            #self.yPolicy = y    
    
