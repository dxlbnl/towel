
from datetime import datetime

from tornado.ioloop import IOLoop, PeriodicCallback

from elophant import Elophant
from database import db
from models import User, Game, GameStats

api = Elophant()

class LoLAPI(object):
    
    def __init__(self, client):
        self.timer = PeriodicCallback(self.status, 1000, IOLoop.instance())
        self.client = client

        self.timer.start()


    def status(self):
        self.client.one.update_status(dict(
            last_updated = datetime.now().strftime("%H:%M:%S %d-%m-%y"),
            game_stats = db.games_data.count(),
            players    = db.users.count(),
            full_games = db.games.count(),
            invalid_games = db.invalid_games.count()
        ))

    def set_user(self, name):
        self.user = User.by_name(name)
        stats = GameStats.find(dict(summoner = self.user.get_dbref()))
        games = [Game.find_one(stat['game_id']) for stat in stats]

        self.client.one.update_games([1, 2, 3, 4, 5, 6, 7]) 
#        self.client.one.update_games(list(stats)) 

    def detach(self):
        self.timer.stop()
