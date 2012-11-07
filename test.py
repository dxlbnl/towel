print 'opening test'

from towel.components import App, Menu, LineEdit, VLayout, HLayout, ListView
from towel.communication import JsonSignal

lineAdded = JsonSignal('lineAdded')
nameChanged = JsonSignal('nameChanged')


    
class Chat(App):
    def __init__(self):
        super(Chat, self).__init__()

        self.username = None
        
        messages = ListView()
        chat_input = LineEdit('Type Here')
        n_input = LineEdit("You can't here")
        
        users = ListView()
        user  = LineEdit("Name")
        
        n_input.disabled = True
        
        chat_input.textEntered.connect(self.on_input)
        chat_input.textEntered.connect(chat_input.clear)
        
        lineAdded.connect(messages.addItem)
        
        chat_input.valueChanged.connect(n_input.setValue)
        
        user.valueChanged.connect(self.name_change)
        
        
        nameChanged.connect(users.replace)
        
        
        chat_layout = VLayout(messages, chat_input, n_input)
        user_layout = VLayout(users, user)
        
        self.layout = HLayout(chat_layout, user_layout)

    def name_change(self, name):
        name = py(name)
#        if not self.username: 
#            lineAdded("welcome: " + py(name))
#        else:
#            lineAdded(self.username + " changed name to: " + py(name))
        nameChanged(name)
        self.username = name

    def on_input(self, line):
        line = py(line)
        if line and self.username:
            lineAdded(self.username + ": " + line)
            
        
        
t = Chat()
t.setRoot()
