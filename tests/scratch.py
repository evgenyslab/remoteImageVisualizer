
import numpy as np
import time
from remoteimagevisualizer import remoteimagevisualizer

vis = remoteimagevisualizer.remoteimagevisualizer()

while True:
    image = ((np.random.rand(800,1200,3))*256).astype(np.uint8)

    vis.show(image)

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

