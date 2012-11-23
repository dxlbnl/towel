import urllib, json, time


class Elophant(object):
    api_key = "ymYeLUVyVbrkeELwzsMX"
    req_url = "http://elophant.com/api/v1/{urlpart}?{params}"

    def __init__(self, region="EUW"):
        self.region = region.lower()

    def url(self, resource, region=None, **params):
        params['key'] = self.api_key
        
        # urlencode parameters
        params = {unicode(k).encode('utf-8') : unicode(params[k]).encode('utf-8') for k in params}

        return self.req_url.format(
            urlpart  = region + "/" + resource if region else resource,
            params   = urllib.urlencode(params)
        )

    @staticmethod
    def json_request(url):
        """
            Request url but with limits
            The url should return `Reset`, `Limit` and `Remaining`    
        """
        
        resp      = urllib.urlopen(url)
        data      = resp.read()

        reset     = int(resp.info().get('Reset'))
        remaining = int(resp.info().get('Remaining'))
        limit     = int(resp.info().get('Limit'))

        print "-> Calling url(({}|{}|{})): {}".format(reset, remaining, limit, url)
        
        if remaining < 10:
            # wait until the reset ends
            print "Waiting {} s.".format(reset)
            time.sleep(reset)

        if data:
            return json.loads(data)
        else:
            return {}

    def request(self, url):
        return Elophant.json_request(url)

    def getSummonerByName(self, name):          return self.request(self.url('getSummonerByName', self.region, summonerName=name))
    def getInProgressGameInfo(self, name):      return self.request(self.url('getInProgressGameInfo', self.region, summonerName=name))

    def getRecentGames(self, id):               return self.request(self.url('getRecentGames', self.region, accountId=id))
    def getMostPlayedChampions(self, id):       return self.request(self.url('getMostPlayedChampions', self.region, accountId=id))

    def getSummonerTeamInfo(self, id):          return self.request(self.url('getSummonerTeamInfo', self.region, summonerId=id))
    def getMasteryPages(self, id):              return self.request(self.url('getMasteryPages', self.region, summonerId=id))
    def getRunePages(self, id):                 return self.request(self.url('getRunePages', self.region, summonerId=id))

    def getSummonerNames(self, ids):            return self.request(self.url('getSummonerNames', self.region, summonerIds=','.join(map(str, ids))))

    def getPlayerStats(self, id, season):       return self.request(self.url('getPlayerStats', self.region, accountId=id, season=season))
    def getRankedStats(self, id, season):       return self.request(self.url('getRankedStats', self.region, accountId=id, season=season))

    def getTeamById(self, teamId):              return self.request(self.url('getTeamById', self.region, teamId=teamId))
    def getTeamByTagOrName(self, tagOrName):    return self.request(self.url('getTeamByTagOrName', self.region, tagOrName=tagOrName))
    def getTeamEndOfGameStats(self, teamId):    return self.request(self.url('getTeamEndOfGameStats', self.region, teamId=teamId))
    def getTeamRankedStats(self, teamId):       return self.request(self.url('getTeamRankedStats', self.region, teamId=teamId))

    def status(self):                           return self.request(self.url('status'))
    def items(self):                            return self.request(self.url('items'))
    def champions(self):                        return self.request(self.url('champions'))

if __name__ == "__main__":
    api = Elophant()
    resp = api.getSummonerByName('neoel')
    resp = api.getSummonerByName('neoel')
    resp = api.getSummonerByName('neoel')

    print resp

