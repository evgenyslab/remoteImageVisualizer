
import numpy as np
import time
from webplot.webplot import webplot

r = webplot()

for _ in range(100):
    image = ((np.random.rand(800,1200,3))*256).astype(np.uint8)
    r.show(image)
    time.sleep(0.1)





import numpy as np
from turbojpeg import TurboJPEG
import time
jpeg = TurboJPEG()

dt = []
for _ in range(1000):
    image = ((np.random.rand(800,1200,3))*256).astype(np.uint8)
    start = time.time()
    jpeg.encode(image, quality=100)
    dt.append(time.time()-start)

#%%

import http
import socketserver
import os

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

def testServer(filePath = None, scripts = None):
    assert(os.path.isfile(filePath))
    handler = generate_handler(filePath, scripts)
    server = socketserver.TCPServer(("", 8888), handler, bind_and_activate=False)
    server.allow_reuse_address = True
    try:
        server.server_bind()
        server.server_activate()
    except:
        server.server_close()
        raise

    # Star the server
    server.serve_forever()


html = '/Users/en/Git/remoteImageVisualizer/webplot/web/index.html'
scripts = [
'/Users/en/Git/remoteImageVisualizer/webplot/web/visualizer.js'
]
testServer(html, scripts)

#%%