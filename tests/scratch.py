
from uWebSockets import Server
import msgpack
import numpy as np
from turbojpeg import TurboJPEG
import time

jpeg = TurboJPEG()
server = Server()
server.run()

while True:
    image = ((np.random.rand(200,400,3))*256).astype(np.uint8)

    data = {
        b"image":jpeg.encode(image),
    }

    packed = msgpack.packb(data)

    server.sendStringAsBinary(packed)
    time.sleep(0.01)



