Widget = None



class Setter(object):
    
    def __init__(self, setter):
        self.setters = [setter]
    
    def set(self, data):
        for setter in self.setters:
            setter(data)
            
    def merge(self, setter):
        self.setters += setter.setters

def getLoopItem(d, node):
    class LoopItem(Widget): 
        directive = d
        template = node
    
    return LoopItem

class LoopSpec(object):
    """Implements the Setter interface"""
    
    def __init__(iterName, directive, node):
        self.items = []
        
        parent = node.parent()
        #node.remove()
        
        self.targets = [{
            'name' : iterName,
            'LoopItem' : getLoopItem(directive, node),
            'loopItems' : [],
            'parent' : parent,
        }]
    
    def set(self, data):
        for item in data:
            self.append(item)
    
    def append(self, item):
        self.items.append(item)
        
        
        for target in self.targets:
            i = target['LoopItem']()
            setattr(i, target['name'], item)
            
            target['loopItems'].append(i)
            
            target['parent'].append(i.node)
            
    
    def merge(self, loopspec):
        self.targets.extend(loopspec.targets)

    from Templates import Widget