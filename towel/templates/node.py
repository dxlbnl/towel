
        

class DOMNode(object):
    
    @JSVar('document')
    def __init__(self, tag=None, attrs={}, children=[], text="", element = None):
        self.classes = []
        
        if tag:
            self.element = document.createElement(tag)
            
            if attrs:    self.setAttributes(**attrs)
            if children: self.addChildren(children)
            if text:     self.setText(text)
        elif element:
            self.element = element
        else:
            print "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
            
    @JSVar('el')
    def getSize(self):
        el = js(self.element)
        return el.clientWidth, el.clientHeight
        
    @JSVar('el')
    def setSize(self, x, y):
        print "Setting size", x, y
        el = js(self.element)
        el.style.width = "%d%%" %x
        el.style.height = "%d%%" %y
            
    @JSVar('document', 'el')
    def setText(self, text):
        el = js(self.element)
        if el.text:
            el.text.textContent = text
        else:
            el.text = document.createTextNode(text)
            el.appendChild(el.text)
    
    @JSVar('el')
    def setAttribute(self, name, value):
        el = js(self.element)
        if name == "class":
            self.addClass(value)
        elif name == "value":
            el.value = value
        else:
            el.setAttribute(name, value)
    
    def setAttributes(self, **attrs):
        for name in attrs:
            self.setAttribute(name, attrs[name])
    
    @JSVar('el')
    def addChild(self, child):
        el = js(self.element)
        child = js(child.element)
        el.appendChild(child)
        
    def addChildren(self, children):
        for child in children:
            self.addChild(child)
        
    @JSVar('el', "Array")
    def children(self):
        res = []
        
        el = js(self.element)
        
        for child in list(Array.prototype.slice.call(el.children)):
            res.append(DOMNode(element=child))
            
        return res
    
    @JSVar("el")
    def setChild(self, child):
        el = js(self.element)
        while el.children.length:
            el.removeChild(el.children[0])
            
        self.addChild(child)
    
    @JSVar('document', 'el')
    def setRoot(self):
        el = js(self.element)
        document.body.appendChild(el)
        print "Set element as root", el
        
    @JSVar('el')
    def addClass(self, cls):
        self.classes.append(cls)
        el = js(self.element)
        el.className = js(' '.join(self.classes))
        
    @JSVar('el')
    def clone(self):
        el = js(self.element)
        return DOMNode(element=el.cloneNode(True))
        
    @JSVar('el')
    def addEvent(self, event, callback):
        el = js(self.element)
        el.addEventListener(event, callback, False)
        
    @JSVar('el','Array')
    def query(self, selector):
        el = js(self.element)
        
        if selector in '. ':
            return [self]
        res = list(Array.prototype.slice.call(el.querySelectorAll(selector)))
        
        elements = []
        for e in res:
            elements.append(DOMNode(element=e))
        
        return elements
        
    @JSVar('el')
    def parent(self):
        el = js(self.element)
        return DOMNode(element=el.parentNode)
        
    @JSVar('el', 'n', 'p')
    def before(self, node):
        parent = self.parent()
        el = js(self.element)
        n  = js(node.element)
        p  = js(parent.element)
        
        p.insertBefore(n, el)
        
    @JSVar('el', 'p')
    def remove(self):
        parent = self.parent()
        p = js(parent.element)
        el = js(self.element)
        p.removeChild(el)
        
    def destroy(self):
        self.remove()
        del self