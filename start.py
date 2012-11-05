from towel import server


def lineAdded(line):
    print 'added', line
    return "Hello World!"


server.add_application("test")
server.add_server("lineAdded", lineAdded)
#server.add_application("chat")
#server.add_application("json_test")
server.start_server();