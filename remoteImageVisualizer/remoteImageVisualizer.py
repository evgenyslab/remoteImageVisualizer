
import msgpack
import threading
from turbojpeg import TurboJPEG
from uWebSockets import Server
from .basicwebserver import basicwebserver

jpeg = TurboJPEG()

"""
Remote Image Visualizer Package
"""

class remoteImageVisualizer:
    def __init__(self):
        self.uwserver = Server()  # need params here...
        self.webserver = basicwebserver()

        # TODO create thread for website server and run



    def show(self, img=None):
        """

        :param img: nxmxc numpy array of image
        :return:
        """
        if not img:
            return

        # check if website is being served:
        if not self.webserver.serving:
            self.webserver.start()

        # check if Server is available

        # if everything is running, package image into jpeg + msgpack, server with server
        data = {
            b"image": jpeg.encode(img),
        }
        packed = msgpack.packb(data)
        self.uwserver.sendStringAsBinary(packed)
