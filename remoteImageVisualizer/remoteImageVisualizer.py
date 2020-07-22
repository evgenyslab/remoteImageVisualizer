
import msgpack
import threading
from uWebSockets import Server
from .websiteserver import websiteserver

"""
Remote Image Visualizer Package
"""

class remoteImageVisualizer:
    def __init__(self):
        self.name = "pythonPackage"
        self.uwserver = Server()  # need params here...

        # create thread for website server and run

    def doWork(self):
        pass


    def show(self, img=None):
        """

        :param img: nxmxc numpy array of image
        :return:
        """

        # check if website is being served:

        # if not served, serve website

        # check if Server is available

        # if everything is running, package image into jpeg + msgpack, server with server
        pass