
from towel.templates.setter import Setter
from towel.templates.node import DOMNode

compileDirective = None

def simpleWidgetFactory(directive, node):
    class SimpleWidget(object): 
        directive = directive
        template = node
        __setters__ = {}
        
        def __init__(self):
            self.node = self.template.clone()
            self.__setters__ = compileDirective(self.directive, [self.node])
        
        def __setattr__(self, name, value):
            value = py(value)
            if name in self.__setters__:
                if isinstance(self.__setters__[name], list):
                    object.__setattr__(self, name, self.__setters__[name])
                else:
                    object.__setattr__(self, name, value)
                    
                self.__setters__[name].set(value)
            else:
                object.__setattr__(self, name, value)
    
    return SimpleWidget

class List(list):
    """Implements the Setter interface"""
    
    def __init__(iterName, directive, node):
        super(List, self).__init__()
        
        parent = node.parent()
        placeholder = DOMNode("span", {"class" : "placeholder"})
        parent.addChild(placeholder)
        node.remove()
        
        self.targets = [{
            'name' : iterName,
            'ListItem' : simpleWidgetFactory(directive, node),
            'placeholder' : placeholder,
            'listItems' : [],
            'parent' : parent,
        }]
        
    def __getitem__(self, item):
        return super(List, self).__getitem__(item)
        
        
    def __setitem__(self, item, value):
        super(List, self).__setitem__(item, value)
        
        
        for target in self.targets:
            i = target['listItems'][item]
            setattr(i, target['name'], value)
        
    def __len__(self):
        return super(List, self).__len__()
    
    def set(self, data):
        for item in data:
            self.append(item)
            
    def merge(self, listspec):
        self.targets.extend(listspec.targets)
    
    def append(self, x):
        super(List, self).append(x)
        
        for target in self.targets:
            i = target['ListItem']()
            setattr(i, target['name'], x)
            
            target['listItems'].append(i)
            target['placeholder'].before(i.node)
    
    def extend(self, l):
        for i in l:
            self.append(i)
    
    def reverse(self):
        super(List, self).reverse()
        for target in self.targets:
            target['listItems'].reverse()
            for item in target['listItems']:
                target['placeholder'].before(item.node)
                
    def insert(self, i, x):
        super(List, self).insert(i, x)
        
        for target in self.targets:
            item = target['ListItem']()
            setattr(item, target['name'], x)
            
            target['listItems'][i].node.before(item.node)
            target['listItems'].insert(i, item)

    def pop(self, i=-1):
        super(List, self).pop(i)
        
        for target in self.targets:
            item = target['listItems'].pop(i)
            item.node.destroy()
            del item
          
    def sort(self, cmp=None, key=None, reverse=False):
        # construct a list of tuples
        
        super(List, self).sort(cmp=cmp, key=key, reverse=reverse)
        
        if not key:
            def key(item):
                return item
        
        for target in self.targets:
            target['listItems'].sort(cmp=cmp, key=lambda i: key(getattr(i, target['name'])), reverse=reverse)
            
            for item in target['listItems']:
                target['placeholder'].before(item.node)

def compileDirective(directive, nodes):
    # returns a dict of valuePointers and setters
    d = {}
    
    for key in directive:
        if '<-' in key:
            # It's a normal list being iterated.
            iterName, valueName = key.split('<-')
            ls = List(iterName, directive[key], nodes[0])
            d[valueName] = ls
            
        else:
            selector, attr = '@' in key and key.split('@') or [key, '']
            
            targets = []
            for node in nodes:
                targets.extend(node.query(selector))
                
            if isinstance(directive[key], str): # its a valuePoitner
                d[directive[key]] = Setter(targets, attr)
            elif isinstance(directive[key], dict): # it's another directive
                res = compileDirective(directive[key], targets)
                
                for k in res:
                    if k in d:
                        d[k].merge(res[k])
                    else:
                        d[k] = res[k]
                        
            else:
                raise NotImplementedError("Still to do some work")
    return d
 