print 'opening test'

from towel.components import App, Menu, LineEdit, VLayout, HLayout, ListView
from towel.communication import JsonSignal

lineAdded = JsonSignal('lineAdded')
nameChanged = JsonSignal('nameChanged')


    
class Chat(App):
    def __init__(self):
        super(Chat, self).__init__()
        
        messages = ListView()
        chat_input = LineEdit('Type Here')
        n_input = LineEdit("You can't here")
        
        users = ListView()
        user  = LineEdit("Name")
        
        n_input.disabled = True
        
        chat_input.textEntered.connect(lineAdded)
        chat_input.textEntered.connect(chat_input.clear)
        
        lineAdded.connect(messages.addItem)
        
        chat_input.valueChanged.connect(n_input.setValue)
        
        user.textEntered.connect(nameChanged)
        
        def change_name(name):
            messages.addItem("name changed to: " + py(name))

        
        nameChanged.connect(change_name)
        
        
        chat_layout = VLayout(messages, chat_input, n_input)
        user_layout = VLayout(users, user)
        
        self.layout = HLayout(chat_layout, user_layout)
        self.layout.setSize(200, 100)
        
        
t = Chat()
t.setRoot()