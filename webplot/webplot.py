
import msgpack
from turbojpeg import TurboJPEG
from uWebSockets import Server
from .webserver import webserver
from mpld3 import fig_to_html as fth
import cv2

jpeg = TurboJPEG()

"""
Remote Image Visualizer Package
"""

class webplot:
    def __init__(self, webport=8889, commport=8890):
        """
        Initialize remote visualizer
        :param webport: Port for web hosting
        :param commport: Port of websocket back-end communication
        """
        self.webserver = webserver(port=webport, commport=commport)  # will start serving automatically
        self.uwserver = Server(port=commport)  # need params here...
        self.uwserver.run()

    def __del__(self):
        self.webserver.stop()
        self.uwserver.stop()

    def stop(self):
        self.webserver.stop()

    def show(self, img=None):
        """

        :param img: nxmxc numpy array of image
        :return:
        """
        try:
            self.showAsJPEG(img)

        except Exception as E:
            print(E)

    def showAsJPEG(self, img=None, quality=85):
        """!
        Note: turbo jpeg default requires BGR Image!

        @param img: nxmxc numpy array of image
        @return:
        """
        try:
            # if everything is running, package image into jpeg + msgpack, server with server
            data = {
                "image": jpeg.encode(img, quality=quality),
            }

            packed = msgpack.packb(data)
            self.uwserver.sendStringAsBinary(packed)
        except Exception as E:
            print(E)


    def plot(self, fig=None):
        """!

        @param dict fig: plotly-style dictionary with 'figure' directive for figure, 'figureConfiguration' for layout,
                        one, or the other.
        @return:
        """
        try:
            self.uwserver.sendStringAsBinary(msgpack.packb(fig))
        except Exception as E:
            print(E)

