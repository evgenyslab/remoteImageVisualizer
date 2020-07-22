import http.server
import socketserver

class MyHttpRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/':
            self.path = '../web/remoteImageVisualizer.html'
        return http.server.SimpleHTTPRequestHandler.do_GET(self)


class basicwebserver:
    def __init__(self, host="0.0.0.0", port=8889):
        self.handler = MyHttpRequestHandler
        self.port = port
        self.serving = False

    def start(self):
        # TODO: create thread for this.
        self.serving = True
        my_server = socketserver.TCPServer(("", self.port), self.handler)
        # Star the server
        my_server.serve_forever()