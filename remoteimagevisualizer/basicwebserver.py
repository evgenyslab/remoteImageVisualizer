import http.server
import socketserver
import threading
import os
import pkg_resources as p


def generate_handler(html, scripts = None):
    """
    Generates an http.server.BaseHTTPRequestHandler that is triggered on webrequest

    :param html: path to root html file
    :param scripts: list of paths to scripts to add to page
    :return:
    """
    if scripts is None:
        scripts = []
    if isinstance(scripts, str):
        scripts = [scripts]
    class MyHandler(http.server.BaseHTTPRequestHandler):
        def do_GET(self):
            """Respond to a GET request."""
            if self.path == '/':
                self.send_response(200)
                self.send_header("Content-type", "text/html")
                self.end_headers()
                self.wfile.write(html.encode())
                for script in scripts:
                    self.wfile.write("\n\n<script>".encode())
                    self.wfile.write(script.encode())
                    self.wfile.write("\n\n</script>".encode())

            else:
                self.send_error(404)

    return MyHandler

class basicwebserver:
    """

    """
    def __init__(self, host="0.0.0.0", port=8889, commport=8890):
        """

        :param host:
        :param port:
        """
        html = p.resource_filename('remoteimagevisualizer', 'web/index.html')
        script = p.resource_filename('remoteimagevisualizer', 'web/bundle.js')
        assert(os.path.isfile(html))
        assert(os.path.isfile(script))
        self.html = open(html, "r").read()
        self.script = open(script, "r").read()
        self.script = self.script.replace("var wsport = \"8890\"", "var wsport = \"" + str(commport) + "\"")
        self.handler = generate_handler(self.html, scripts=[self.script])
        self.host = host
        self.port = port
        self.server = None
        self.serving = False
        self.serverThread = None
        self.start()


    def stop(self):
        """

        :return:
        """
        self.server.shutdown()
        self.serverThread.join()
        print("Stopping web serving")


    def start(self):
        """

        :return:
        """
        self.serverThread = threading.Thread(target=self.serve)
        self.serverThread.start()
        self.serving = True

    def serve(self):
        """

        :return:
        """
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

