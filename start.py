#!/home/dexter/.virtualenvs/bin/python

from towel import server

from chatServer import ChatServer
from lol.server import LoLAPI


server.add_application("chat")
server.add_application("lol.client")

server.add_server(ChatServer)
server.add_server(LoLAPI)
server.start_server();
