print 'opening test'

from towel.components import App, Menu, LineEdit, VLayout, HLayout, ListView
from towel.communication import JsonSignal

lineAdded = JsonSignal('lineAdded')


class Chat(App):
    def __init__(self):
        super(Chat, self).__init__()
        
        lv = ListView()
        l = LineEdit('Type Here')
        l1 = LineEdit("You can't here")
        l1.disabled = True
        
        l.textEntered.connect(lineAdded)
        lineAdded.connect(lv.addItem)
        
        l.valueChanged.connect(l1.setValue)
        
        
        l.sortNow.connect(lv.sort)
        
        layout1 = VLayout(lv, l, l1)
        
        l2 = LineEdit("Filter")
        
        self.layout = HLayout(layout1, l2)
        self.layout.setSize(100, 100)
        
        
t = Chat()
t.setRoot()