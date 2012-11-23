
from database import db
from models import Game, GameStats, User


games_data = db.games_data.find()

print "Processing 

for g in games_data:
    GameStats.store_game(g)
