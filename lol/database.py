from mongokit import Document, Connection

connection = Connection('localhost', 27017)
db = connection.lol_data

