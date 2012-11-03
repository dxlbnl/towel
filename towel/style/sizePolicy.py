from Style import Sheet


class SizePolicy(object):
    
    sheet = Sheet("layout")
    expanding = ''
    fixed = ''
    
    def __init__(self, obj, x, y):
        self.obj = obj
        self.setSize(x, y)
        
    
    def setSize(self, x, y):
        
        if isinstance(x, int):
            print self.obj
            self.sheet.setRule("#" + str(self.obj.id), {
                'width' : str(x) + 'px', 
                'position' : 'absolute', 
                'left' : '50%', 
                'margin-left' : str(-(x/2)) + 'px'
            })
            self.xPolicy = x 
        
        if y:
            self.yPolicy = y    
    