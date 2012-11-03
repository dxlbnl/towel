
from Templates import DOMNode

class Sheet(DOMNode):
    
    @JSVar('document', 'el', 'Array', 'rule')
    def __init__(self, name, disabled=False):
        super(Sheet, self).__init__("style", {"type":"text/css"})
        
        self.rules = {}
        
        el = js(self.element)
        document.head.appendChild(el)
        
        self.sheet = el.sheet
        print "found sheet", self.sheet
        
        for rule in list(Array.prototype.slice.call(el.sheet.rules)):
            self.rules[py(rule.selectorText)] = rule.style
            
        
    @JSVar('sheet', 'r', 'Array')
    def _makeRule(self, rule):
        sheet = js(self.sheet)
        sheet.addRule(js(rule))
        
        # added, now look it up
        for r in list(Array.prototype.slice.call(sheet.rules)):
            if py(r.selectorText) == rule:
                return r.style
        
    @JSVar('style')
    def setRule(self, rule, properties={}):
        if rule not in self.rules:
            self.rules[rule] = self._makeRule(rule)
            
        style = js(self.rules[rule])
        
        for prop in properties:
            style.setProperty(prop, properties[prop])
            
        
         
