from towel import server

        

class Chat(object):
    users = []
    
    def __init__(self, client):
        self.client = client
        self.name = "Guest"
        
        
    def on_message(self, msg):
        # notify all other users.
        self.client.all.on_message(msg)
        
    def name_changed(self, name):
        
        self.name = name        
        self.users.append(name)
        self.users.sort()
        
        self.client.all.update_users(self.users)
    

server.add_application("test")

server.add_server(Chat)
server.start_server();
