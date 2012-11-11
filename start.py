from towel import server

        

class Chat(object):
    users = []
    
    def __init__(self, client):
        
        print "Creating chat", self.users
        self.client = client
        for i in range(10):
            n = "Guest-{}".format(i)
            if n not in self.users:
                self.name = n
                self.users.append(self.name)
                break
        
        self.client.one.name_change(self.name)
        
        
    def on_message(self, msg):
        # notify all other users.
        self.client.all.on_message(msg)
        
    def name_changed(self, name):
        print "name changed", name
        if self.name in self.users:
            self.users.remove(self.name)
            
        self.name = name        
        self.users.append(name)
        self.users.sort()
        
        self.client.all.update_users(self.users)
    
    def detach(self):
        self.users.remove(self.name)
        self.client.all.update_users(self.users)

server.add_application("chat")

server.add_server(Chat)
server.start_server();
