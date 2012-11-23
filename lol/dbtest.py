from database import db

from pprint import pprint, pformat

def aggr(i):
    return db.games_data.aggregate([
        {"$limit"   : i},
        {'$project' : {'fellowPlayers' : 1, 'gameId' : 1, 'userId' : 1}},
        {'$unwind'  : '$fellowPlayers'},
        {"$project" : {'game_id' : '$gameId', 'summoner_id' : '$fellowPlayers.summonerId', 'user_id' : '$userId'}},
        {'$group'   : {'_id' : {'game_id':'$game_id', 'user_id':'$user_id'}, 'players' : {'$sum' : 1 }}}
    ])['result']

pprint(aggr(10))

