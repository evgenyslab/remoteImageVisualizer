# NOTES

- need to have npm installed with browserify, and msgpack-lite to run the js bundling before deployment

Currently, had to move `web` folder into `package` folder for it to be correctly copied into EGG file 
and correctly accessed for html. However, JS bundle needs to be copied into html, otherwise would need to 
dynamically set the bundle.js file link in the html file.

It might make more sense to simply generate the combined html file with bundled js emedded during run-time, but 
then would need to answer the question how to serve a raw text file... unless a temporary file is created locally and
then removed...

- can manifest file be removed now?

## Pre-reqs

- [ ] (uWebSocketsPython)[]
- [ ] Libturbojpeg

## Limitations

JPEG compression + image size + processing power will limit the maximum framerate.

## TODO

- replace cv2 png compression with libpng/ something simpler
- js auto resize image to window size
- js display cursor pixel position
- js allow zoom in
- open image in new window (popup)
- can manifest file be removed?
- can html be auto generated in runtime?

## Example

```python
import numpy as np
import time
from remoteimagevisualizer import remoteimagevisualizer

# Create visualizer object:
vis = remoteimagevisualizer.remoteimagevisualizer()

# Create video-like stream of noisy image
while True:
    image = ((np.random.rand(200,400,3))*256).astype(np.uint8)

    # show image
    vis.show(image)
    # change quality 50%:
    vis.showAsJPEG(image, quality=50)
    # change quality 95%:
    vis.showAsJPEG(image, quality=95)
    # show as PNG no compression:
    vis.showAsPNG(image, quality=0)
    # show as PNG  max compression:
    vis.showAsPNG(image, quality=9)
    # delay for 100ms (can drop it down to 10ms
    time.sleep(0.1)
```