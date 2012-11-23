
from bson.objectid import ObjectId
from bson.dbref import DBRef
from mongokit import Document, Connection

import re
from datetime import datetime, timedelta

from elophant import Elophant
from database import connection, db
api = Elophant()

@connection.register
class User(Document):
    __collection__ = 'users'
    __database__   = 'lol_data'
    
    use_dot_notation = True
    use_autorefs     = True
    
    games_outdated = timedelta(hours=2)
    
    structure = dict(
        _id             = int,
        summoner_id     = int,
        name            = unicode,
        simple_name     = unicode,
        profile_icon    = int,
        summoner_level  = int,
        games_updated   = datetime
    )

    indexes = [
        dict(fields=['name']),
        dict(fields=['simple_name'])
    ]
   
    def get_dbref(self):
        return DBRef(self.__collection__, self._id, self.__database__)
    
    @staticmethod
    def by_name(name):
        User = db.users.User
        user = User.find_one({"$or" : [dict(name = name), dict(simple_name = name)]})
        
        if not user:
            print "Fetching user:", name
            user_data = api.getSummonerByName(name)
            if user_data:
                user = User()
                
                user._id             = user_data['acctId']
                user.summoner_id     = user_data['summonerId']
                user.name            = user_data['name']
                user.simple_name     = user_data['internalName']
                user.profile_icon    = user_data['profileIconId']
                user.summoner_level  = user_data['summonerLevel']
                
                user.save()
            else:
                return None

            
        return user
    
    @staticmethod
    def by_account_id(id):
        print "name:", id, api.getPlayerStats(id, "TWO")
    
    @staticmethod
    def update_all_users():
        """find all users who are not updated, or havent been recently updated. Update those"""
        users = User.find({'$or' : [
            {'games_updated' : {"$exists" : False}}, 
            {'games_updated': {'$lt' : datetime.now() - User.games_outdated}}
        ]})
        
        print "Updating", users.count(), "users"
        
        for user in users:
            user.update_games()
    
    def games(self):
        return list(db.games_data.find(dict(userId = self._id)))

    def update_games(self):
        """Updates the played games by getting the recently played games from the api, and stores that in the db."""
        
        if not hasattr(self, 'games_updated') or not self.games_updated or (self.games_updated < (datetime.now() - self.games_outdated)):
                
            print "update games"
            
            gamedata = api.getRecentGames(self._id)
            try:
                games = gamedata['gameStatistics']

                gameIds = [game['gameId'] for game in games]

                cachedGameIds = [
                    game['gameId'] 
                        for game
                        in db.games_data.find({'userId' : self._id}, fields=['gameId'])
                ]
                notCachedGames = [game for game in games if game['gameId'] not in cachedGameIds]
                print "Saved {} new games".format(len(notCachedGames))
            
                if notCachedGames:
                    db.games_data.insert(notCachedGames)
                
                self['games_updated'] = datetime.now()
                self.save()
            except KeyError as e:
                print "update_games failed with", gamedata
                raise e
        
    def current_game(self):
        return api.getInProgressGameInfo(self.name)

        
unhandled_stats = set()       
@connection.register
class GameStats(Document):
    __collection__ = 'game_stats'
    __database__   = 'lol_data'

    use_dot_notation = True
    use_autorefs = True

    structure = dict(
        summoner = User,
        game_id  = int,
        won      = bool,
        spell1   = int,
        spell2   = int,
        items    =  list,
        champion_id = int,
        level = int,
        ip_earned  = int,
        boost_ip = int,
        gold_earned = int,
        premade = bool,
        physical_damage_dealt = int,
        magical_damage_dealt = int,
        total_damage_dealt = int,
        largest_critical_strike = int,
        physical_damage_taken = int,
        magical_damage_taken = int,
        total_damage_taken = int,
        total_heal = int,
        deaths = int,
        assists = int,
        kills = int,
        largest_multikill = int,
        largest_killingspree = int,
        minions_killed = int,
        neutral_minions_killed = int,
        turrets_destroyed = int,
        barracks_destroyed = int,
        time_spent_dead = int,
        vision_wards_bought = int,
        sight_wards_bought = int,
        ping = int,
        afk = bool,
        leaver = bool,
        first_win = bool
    )

    indexes = [
        dict(fields = ['summoner', 'game_id'])
    ]
    
    
    # todo items, win
    stats_map = dict(
        NEUTRAL_MINIONS_KILLED       = "neutral_minions_killed",
        MINIONS_KILLED               = "minions_killed",
        PHYSICAL_DAMAGE_TAKEN        = "physical_damage_taken",
        LARGEST_CRITICAL_STRIKE      = "largest_critical_strike",
        TOTAL_DAMAGE_DEALT           = "total_damage_dealt",
        ASSISTS                      = "assists",
        TOTAL_HEAL                   = "total_heal",
        LARGEST_KILLING_SPREE        = "largest_killingspree",
        LEVEL                        = "level",
        MAGIC_DAMAGE_TAKEN           = "magical_damage_taken",
        NUM_DEATHS                   = "deaths",
        GOLD_EARNED                  = "gold_earned",
        PHYSICAL_DAMAGE_DEALT_PLAYER = "physical_damage_dealt",
        CHAMPIONS_KILLED             = "kills",
        MAGIC_DAMAGE_DEALT_PLAYER    = "magical_damage_dealt",
        TOTAL_DAMAGE_TAKEN           = "total_damage_taken",
        LARGEST_MULTI_KILL           = "largest_multikill",
        TOTAL_TIME_SPENT_DEAD        = "time_spent_dead",
        VISION_WARDS_BOUGHT_IN_GAME  = "vision_wards_bought",
        SIGHT_WARDS_BOUGHT_IN_GAME   = "sight_wards_bought",
        TURRETS_DESTROYED            = "turrets_destroyed",
        BARRACKS_DESTROYED           = "barracks_destroyed",
        TURRETS_KILLED               = "turrets_destroyed",
        BARRACKS_KILLED              = "barracks_destroyed",
    )                                 

    @classmethod
    def store_game(cls, data):
        
        user = User.find_one(data['userId'])
        user_ref = DBRef('users', user._id, 'lol_data')
        
        game_stats = GameStats.find_one(dict(game_id = data['gameId'], summoner=user_ref))
        
        if not game_stats:
            print "creating game_stats", user.name, data['gameId']
            game_stats = GameStats()
            
            game_stats.summoner = user
            game_stats.ping = data['userServerPing'] 
            game_stats.afk = data['afk']
            game_stats.leaver = data['leaver']
            game_stats.game_id = data['gameId']
            game_stats.spell1 = data['spell1']
            game_stats.spell2 = data['spell2']
            game_stats.champion_id = data['championId']
            game_stats.level = data['level']
            game_stats.ip_earned  = data['ipEarned']
            game_stats.boost_ip = data['boostIpEarned']
            game_stats.first_win = data['eligibleFirstWinOfDay']
            game_stats.premade = data['premadeTeam']
            
            items = []
            for stat in data['statistics']:
                key = stat['statType']
                value = stat['value']
                
                attribute = GameStats.stats_map.get(key)
                if attribute:
                    setattr(game_stats, attribute, value)
                elif key[:4] == "ITEM":
                    items.append(value)
                elif key in ["WIN", "LOSE"]:
                    game_stats.win = (key == "WIN")
                else:
                    unhandled_stats.add(key)
                    print "=> Stattype not in stats_map:", key
                    
            game_stats['items'] = items
                
            
            game_stats.save()
            
        return game_stats


invalid_games = db.invalid_games

@connection.register
class Game(Document):
    __collection__ = 'games'
    __database__   = 'lol_data'

    use_dot_notation = True
    use_autorefs     = True
    
    structure = dict(
        _id  = int,
        map_id = int,
        won = unicode,
        team1  = [GameStats],
        team2  = [GameStats],
        time = datetime
    )

    @staticmethod
    def store(data):

        game = Game.find_one(data['gameId'])
        if not game:
            print "creating game:", data['gameId']
            game = Game()

            game._id    = data['gameId']
            game.map_id = data['gameMapId']
            game.time   = datetime.strptime(data['createDate'], "%Y-%m-%d %H:%M:%SZ")

            # collect own gamestats:
            
            gamestats = GameStats.store_game(data)
            if data['teamId'] == 100:
                game.team1.append(gamestats)
            else:
                game.team2.append(gamestats)
            
            for fellow in data['fellowPlayers']:
                user = User.by_name(fellow['summonerName'])
                if user:
                    user.update_games()
                    print 'user', user.name
                    
                    gamestats = GameStats.find_one(dict(summoner = user.get_dbref(), game_id = game._id))
                    if not gamestats:
                        print "didnt find gamestats"
                        u_game = db.games_data.find_one(dict(gameId = game._id, userId = user._id))
                        if u_game:
                            gamestats = GameStats.store_game(u_game)
                            print "Found raw game data"
                        else:
                            print "---------- INCOMPLETE ---------------"
                            invalid_games.insert(dict(_id = game._id))
                            return   
                    else:
                        print "---------- INCOMPLETE ---------------"
                        invalid_games.insert(dict(_id = game._id))
                        return   
                else:
                    print "---------- INCOMPLETE ---------------"
                    invalid_games.insert(dict(_id = game._id))
                    return
                        
                if fellow['teamId'] == 100:
                    game.team1.append(gamestats)
                else:
                    game.team2.append(gamestats)
                    
            print "------------- COMPLETE  --------------"
            print "------------- {} --------------".format(game._id)
            print "Saving game", game
                    
            # if its totally complete, save it
            game.save()
            
        return game

        # for each player, fetch that user, and look for this game.in the recently played games.
        # if thats not available, delete this one.
        

User = db.users.User
GameStats = db.game_stats.GameStats
Game = db.games.Game



    

