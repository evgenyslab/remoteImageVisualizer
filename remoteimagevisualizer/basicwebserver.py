import http.server
import socketserver
import threading
import os
import pkg_resources

def generateLocalHtml():

    pass

class MyHttpRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        return http.server.SimpleHTTPRequestHandler.do_GET(self)


class basicwebserver:
    def __init__(self, host="0.0.0.0", port=8889):
        self.handler = MyHttpRequestHandler
        self.htmlFilePath = '/tmp/index.html'
        self.host = host
        self.port = port
        self.server = None
        self.serving = False
        self.createHTMLfile()
        self.start()


    def createHTMLfile(self):
        try:
            MyHttpRequestHandler.path = '../web/remoteImageVisualizer.html'
            assert (os.path.isfile(MyHttpRequestHandler.path))
        except AssertionError as E:
            print('html file not found')
            resource_package = __name__
            MyHttpRequestHandler.path = pkg_resources.resource_filename(resource_package, 'web/remoteImageVisualizer.html')
            f = open(MyHttpRequestHandler.path, "r")
            hdata = f.read()
            f.close()
            f = open(self.htmlFilePath, "w")
            f.write(hdata)
            f.close()
            MyHttpRequestHandler.path = self.htmlFilePath


    def stop(self):
        self.server.shutdown()
        self.serverThread.join()
        print("Stopping web serving")
        print("Removing page")
        if (os.path.isfile(self.htmlFilePath)):
            os.remove(self.htmlFilePath)

    def start(self):
        self.serverThread = threading.Thread(target=self.serve)
        self.serverThread.start()
        self.serving = True

    def serve(self):
        print("Starting web serving at: http://{:s}:{:d}\n\n".format(self.host,self.port))
        self.server = socketserver.TCPServer(("", self.port), self.handler, bind_and_activate=False)
        self.server.allow_reuse_address = True
        try:
            self.server.server_bind()
            self.server.server_activate()
        except:
            self.server.server_close()
            raise

        # Star the server
        self.server.serve_forever()

