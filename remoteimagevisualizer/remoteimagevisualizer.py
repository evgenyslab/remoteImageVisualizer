
import msgpack
from turbojpeg import TurboJPEG, TJPF_BGR, TJCS_RGB
from uWebSockets import Server
from .basicwebserver import basicwebserver
from mpld3 import fig_to_html as fth
import cv2
import numpy as np

jpeg = TurboJPEG()

"""
Remote Image Visualizer Package
"""

class remoteimagevisualizer:
    def __init__(self, webport=8889, commport=8890):
        """
        Initialize remote visualizer
        :param webport: Port for web hosting
        :param commport: Port of websocket back-end communication
        """
        self.webserver = basicwebserver(port=webport, commport=commport)  # will start serving automatically
        self.uwserver = Server(port=commport)  # need params here...
        self.uwserver.run()

    def __del__(self):
        self.webserver.stop()
        self.uwserver.stop()

    def __getEncoding__(self, encodingString=""):
        if encodingString.lower() == 'rgb':
            return TJCS_RGB
        elif encodingString.lower() == 'bgr':
            return TJPF_BGR
        else:
            raise("Encoding format <{:s}> is invalid!".format(encodingString))

    def stop(self):
        self.webserver.stop()

    def show(self, img=None, encoding="BGR"):
        """

        :param img: nxmxc numpy array of image
        :return:
        """
        try:
            if len(img.shape) == 2:
                img = np.stack([img,img,img],axis=2)
            elif len(img.shape) == 3 and img.shape[-1] == 1:
                img = img.squeeze()
                img = np.stack([img,img,img],axis=2)

            self.showAsJPEG(img, encoding=encoding)

        except Exception as E:
            print(E)

    def showAsJPEG(self, img=None, encoding="BGR", quality=85):
        """
        Turbo JPEG uses BGR by default
        :param img: nxmxc numpy array of image
        :return:
        """
        try:
            sourceEncoding = self.__getEncoding__(encoding)
            # if everything is running, package image into jpeg + msgpack, server with server
            data = {
                b"image": jpeg.encode(img, pixel_format=sourceEncoding, quality=quality),
                # "width": img.shape[1],
                # "height": img.shape[0]
            }

            packed = msgpack.packb(data)
            self.uwserver.sendStringAsBinary(packed)
        except Exception as E:
            print(E)

    def showAsPNG(self, img=None, encoding="BGR", quality=1):
        """

        :param img: nxmxc numpy array of image
        :return:
        """
        try:
            if encoding.lower() == "rgb":
                img = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)
            elif encoding.lower() != "bgr":
                raise("Encoding format <{:s}> is invalid!".format(encoding))
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

    def showFig(self, fig=None):
        try:
            fhtml = fth(fig)
            figHTMLcombined = fhtml.split("<script>")
            figHTML = figHTMLcombined[0]
            figJS = figHTMLcombined[1].replace("</script>", "")
            dataFig = {
                b'figure': True,
                b'html': figHTML,
                b'js': figJS
            }
            self.uwserver.sendStringAsBinary(msgpack.packb(dataFig))
        except Exception as E:
            print(E)

