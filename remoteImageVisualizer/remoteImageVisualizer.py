
import msgpack
from turbojpeg import TurboJPEG
from uWebSockets import Server
from .basicwebserver import basicwebserver
import cv2

jpeg = TurboJPEG()

"""
Remote Image Visualizer Package
"""

class remoteimagevisualizer:
    def __init__(self):
        self.webserver = basicwebserver()  # will start serving automatically
        self.uwserver = Server()  # need params here...
        self.uwserver.run()


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
        """

                :param img: nxmxc numpy array of image
                :return:
                """
        try:
            # if everything is running, package image into jpeg + msgpack, server with server
            data = {
                b"image": jpeg.encode(img, quality=quality),
                # "width": img.shape[1],
                # "height": img.shape[0]
            }

            packed = msgpack.packb(data)
            self.uwserver.sendStringAsBinary(packed)
        except Exception as E:
            print(E)

    def showAsPNG(self, img=None, quality=1):
        """

        :param img: nxmxc numpy array of image
        :return:
        """
        try:
            # if everything is running, package image into jpeg + msgpack, server with server
            data = {
                b"image": cv2.imencode('.png', img, [cv2.IMWRITE_PNG_COMPRESSION, quality])[1].tobytes(),
                # "width": img.shape[1],
                # "height": img.shape[0]
            }

            packed = msgpack.packb(data)
            self.uwserver.sendStringAsBinary(packed)
        except Exception as E:
            print(E)

