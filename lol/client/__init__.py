
from towel.components import App, VLayout, HLayout, LineEdit, ListView
from towel.communication import Connection


class LoL(App):
    def __init__(self):
        self.server = Connection("LoLAPI", self)

        self.user         = LineEdit("Username")
        self.status       = ListView()
        self.user_stats   = ListView()
        self.recent_games = ListView()

        self.user.textEntered.connect(self.server.set_user)
        
        
        self.layout = VLayout(
            HLayout(self.status, self.user),
            HLayout(self.user_stats, self.recent_games)
        )
        self.server.status()
        
            
    def update_status(self, status):
        status = py(status)
        l = []
        for k in status:
            l.append(k + ": " + str(status[k]))
        self.status.replace(l)
        #print "Update status", status
        
    def update_games(self, data):
        self.recent_games.replace(data)

        
lol = LoL()
lol.layout.setRoot()
