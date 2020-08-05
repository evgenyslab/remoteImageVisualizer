import http.server
import socketserver
import threading
import os
import pkg_resources as p


def generate_handler(html, scripts = None):
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
                self.wfile.write(open(html, "r").read().encode())
                for script in scripts:
                    print("loading script at: " + script)
                    self.wfile.write("\n\n<script>".encode())
                    self.wfile.write(open(script, "r").read().encode())
                    self.wfile.write("\n\n</script>".encode())

            else:
                self.send_error(404)

    return MyHandler

class basicwebserver:
    def __init__(self, host="0.0.0.0", port=8889):
        html = p.resource_filename('remoteimagevisualizer', 'web/index.html')
        script = p.resource_filename('remoteimagevisualizer', 'web/bundle.js')
        assert(os.path.isfile(html))
        assert(os.path.isfile(script))
        self.handler = generate_handler(html, scripts=[script])
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

