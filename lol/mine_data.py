from models import User, Game,   unhandled_stats, invalid_games
from database import db
import re

from pprint import pprint
        
def update_users():
    users = [
        'neoel'#, 'inflammae', 'empathia', 'xenotos', 'volcanow7', 'dingesenator', 'de kleine wolf', 'themvanh', 'metamess', 'rastaroos', 'eelse', 'sneeuwwit'
    ]
    
    #users = User.find().sort('games_updated')
    #users = User.find()
    users = User.find({'simple_name' : {'$in' : users}})
    n_users_done = 1
    for user in users:
        print u"+++ Updating user({}): {}".format(n_users_done, user.name)
        user.update_games()
        n_users_done += 1
        
        # for each user fetch each game, and update that
        gamedata = db.games_data.find(dict(userId = user._id))
        for g in gamedata:
            if not invalid_games.find_one(g['gameId']):
                g = Game.store(g)
            else:
                print "invalid game"

def update_games():
    c  =  db.games_data.find({'createDate' : re.compile("^2012-11-2")})
    print "Updating {} games".format(c.count())

    for g in c:
        if not invalid_games.find_one(g['gameId']):
            print "+++ Creating game", g['createDate']
            g = Game.store(g)
        else:
            print "invalid game"
    
        
if __name__ == "__main__":
    #u = User.by_name('volcanow7')
    update_users()
   #update_games()
    
    #User.update_all_users()
    
    print unhandled_stats
 
