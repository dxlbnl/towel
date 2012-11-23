
from towel.templates import DOMNode

class Sheet(DOMNode):
    
    @JSVar('document', 'el', 'Array', 'rule')
    def __init__(self, name):
        super(Sheet, self).__init__("style", {"type":"text/css"})
        
        self.rules = {}
        
        el = js(self.element)
        document.head.appendChild(el)
        
        self.sheet = el.sheet
        print "found sheet", self.sheet
        
        rules = el.sheet.rules or el.sheet.cssRules
        
        for rule in list(Array.prototype.slice.call(rules)):
            self.rules[py(rule.selectorText)] = rule.style
            
        
    @JSVar('sheet', 'r', 'Array')
    def _make_rule(self, rule):
        sheet = js(self.sheet)
        sheet.addRule(js(rule))

        rules = sheet.rules or sheet.cssRules
        
        # added, now look it up
        for r in list(Array.prototype.slice.call(rules)):
            if py(r.selectorText) == rule:
                return r.style
        
    @JSVar('style')
    def set_rule(self, rule, properties={}):
        if rule not in self.rules:
            self.rules[rule] = self._make_rule(rule)
            
        style = js(self.rules[rule])
        
        for prop in properties:
            style.setProperty(prop, properties[prop])
            
        
         
