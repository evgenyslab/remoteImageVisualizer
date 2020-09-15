
import msgpack
from turbojpeg import TurboJPEG, TJPF_BGR, TJCS_RGB
from uWebSockets import Server
from webplot.webserver import webserver
import numpy as np
import warnings

jpeg = TurboJPEG()

"""
Remote Image Visualizer Package
"""


class webplot:
    def __init__(self, webport=8889, commport=8890, serveDirectory=""):
        """
        Initialize remote visualizer
        :param webport: Port for web hosting
        :param commport: Port of websocket back-end communication
        """
        self.webserver = webserver(port=webport,
                                   commport=commport,
                                   serveDirectory=serveDirectory)  # will start serving automatically
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

    def __tryToDecodeMessage__(self, message):
        """
        strings will have signature `b'string'`
        lists of strings will have signature `b'string,string'` -> indistinguishable from string
        msgpack object will have signature `b'\\x....\...'
        dict object will have signature `b'[object Object]'
        """
        # try to decode string, or dict or list...
        decodedData = []
        try:
            decodedData = msgpack.unpackb(message)
        except Exception as e:
            try:
                decodedData = message.decode('UTF-8')
            except Exception as e:
                warnings.warn("Could not decode returned message as string")
        return decodedData

    def getMessages(self):
        # TODO: how to make this a call back that actives when uwserver.readNonBlocking() is not null?
        # maybe need to put callback in uwserver; maybe asyncio
        message = self.uwserver.readNonBlocking()
        if len(message) > 0:
            return self.__tryToDecodeMessage__(message)
        return []

    def getLastMessage(self):
        message = self.uwserver.readLastNonBlocking()
        if len(message) > 0:
            return self.__tryToDecodeMessage__(message)
        return []

    def stop(self):
        self.webserver.stop()

    def show(self, img=None, encoding="RGB", decorators=None):
        """!

        @param np.array img: nxmxc numpy array of image
        @param string encoding: encoding string
        @return:
        """
        try:
            if len(img.shape) == 2:
                img = np.stack([img, img, img], axis=2)
            elif len(img.shape) == 3 and img.shape[-1] == 1:
                img = img.squeeze()
                img = np.stack([img, img, img], axis=2)

            self.showAsJPEG(img, encoding, decorators=decorators)

        except Exception as E:
            print(E)

    def showAsJPEG(self, img=None, encoding="RGB", quality=85, decorators=None):
        """!
        Note: turbo jpeg default requires BGR Image!

        @param np.array img: nxmxc numpy array of image
        @param string encoding: encoding string
        @param quality: compression quality
        @param list decorators: a list of dict items, one per decorator (line/rect/text) using HTML5 canvas api.
        @return:
        """
        try:
            sourceEncoding = self.__getEncoding__(encoding)
            # if everything is running, package image into jpeg + msgpack, server with server
            data = {
                "image": {
                    "raw":  jpeg.encode(img, pixel_format=sourceEncoding, quality=quality)
                },
            }
            if isinstance(decorators, list):
                data['image']['decorators'] = decorators

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

