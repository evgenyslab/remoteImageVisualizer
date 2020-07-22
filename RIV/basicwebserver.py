import http.server
import socketserver
import threading
import os
import pkg_resources

def generateLocalHtml():

    pass

class MyHttpRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/':
            try:
                self.path = '../web/remoteImageVisualizer.html'
                assert(os.path.isfile(self.path))
            except AssertionError as E:
                print('html file not found')
                resource_package = __name__
                self.path = pkg_resources.resource_filename(resource_package, 'web/remoteImageVisualizer.html')
                print("New path: " + str(self.path))

        return http.server.SimpleHTTPRequestHandler.do_GET(self)


class basicwebserver:
    def __init__(self, host="0.0.0.0", port=8889):
        self.handler = MyHttpRequestHandler
        self.host = host
        self.port = port
        self.server = None
        self.serving = False
        self.start()


    def stop(self):
        self.server.shutdown()
        self.serverThread.join()
        print("Stopping web serving")

    def start(self):
        self.serverThread = threading.Thread(target=self.serve)
        self.serverThread.start()
        self.serving = True

    def serve(self):
        print("Starting web serving at: http://{:s}:{:d}\n\n".format(self.host,self.port))
        self.my_server = socketserver.TCPServer(("", self.port), self.handler)
        # Star the server
        self.my_server.serve_forever()

