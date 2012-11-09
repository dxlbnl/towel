print 'opening test'

from towel.components import App, Menu, LineEdit, VLayout, HLayout, ListView
from towel.communication import JsonSignal

ChatServer = JsonSignal('Chat')
#nameChanged = JsonSignal('nameChanged')
    
class Chat(App):
    def __init__(self):
        super(Chat, self).__init__()

        self.username = None
        
        self.messages = ListView()
        chat_input = LineEdit('Type Here')
        n_input = LineEdit("You can't here")
        
        self.users = ListView()
        user  = LineEdit("Name")
        
        n_input.disabled = True
        
        chat_input.textEntered.connect(self.on_input)
        chat_input.textEntered.connect(chat_input.clear)
        
        chat_input.valueChanged.connect(n_input.setValue)
        
        user.textEntered.connect(self.name_change)
        
        chat_layout = VLayout(self.messages, chat_input, n_input)
        user_layout = VLayout(self.users, user)
        
        self.layout = HLayout(chat_layout, user_layout)

    def name_change(self, name):
        name = py(name)
#        if not self.username: 
#            lineAdded("welcome: " + py(name))
#        else:
#            lineAdded(self.username + " changed name to: " + py(name))
        ChatServer.name_changed(name)
        self.username = name
        
    def update_users(self, users):
        self.users.replace(users)
        
    def on_message(self, line):
        self.messages.addItem(line)

    def on_input(self, line):
        line = py(line)
        if line and self.username:
            ChatServer.on_message(self.username + ": " + line)
            
       

t = Chat()


ChatServer.connect(t)
t.setRoot()
