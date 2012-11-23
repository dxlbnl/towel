
from elophant import Elophant
import urllib
import os.path

from pymongo import Connection

db = Connection().lol_data

api = Elophant()


class Champion(object):
    image_url = "http://euw.leagueoflegends.com/sites/default/files/game_data/1.0.0.150/content/champion/icons/{}"
    extension = "jpg"

    @staticmethod
    def update_images():
        champs = db.champions.find({'id' : {"$gt" : 0}})
        print champs
        for champ in champs:
            print "downloading champ", champ['name']
            filename = "{}.{}".format(champ['id'], Champion.extension)
            f = open(os.path.join('champions', filename), 'wb')

            f.write(urllib.urlopen(Champion.image_url.format(filename)).read())
            f.close()



if __name__ == "__main__":
    Champion.update_images()
