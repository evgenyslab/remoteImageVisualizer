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

- [ ] webSockets:
    
    This can be installed into a local virual env:
    
    ```bash
    git clone https://github.com/evgenyslab/webSockets.git
    # active local virtual environment
    # using virtual environemt:
    cd webSockets/
    python setup.py install
    ```
    
- [ ] Libturbojpeg

## FIGURE PLOTTING

The web-backend uses Plotly. Please refer to [HERE](https://plotly.com/javascript/basic-charts/)
for examples that show you how to format data dictionary to pass, including layouts.

**MAIN NOTE** the webplot uses a `figure` tag at the top level of the dictionary to
indication figure information, and a `figureConfiguration` tag to indicate figure 
layout information.

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
- UNBIND SOCKET FROM HTTP (done)
- clean webserver thread exit needed on ctrl-c or ctrl-d


## Example

### Displaying Image

```python
import numpy as np
import time
from webplot import webplot

# Create visualizer object:
wp = webplot()

# Create video-like stream of noisy image
for _ in range(100):
    image = ((np.random.rand(200,400,3))*256).astype(np.uint8)
    # show image
    wp.show(image)
    time.sleep(0.1)
```

### Displaying Figure

```python
import numpy as np
import time
from webplot import webplot

# Create visualizer object:
wp = webplot()

npts = 500
# create plotly data object:
dataPlotly = {
    'figure': {
        'x': np.random.rand(1, npts).flatten().tolist(),
        'y': np.random.rand(1, npts).flatten().tolist(),
        'z': np.random.rand(1, npts).flatten().tolist(),
        'mode': 'markers',
        'marker': {
            'size': 12,
            'line': {
                'color': 'rgba(217, 217, 217, 0.14)',
                'width': 0.5
            },
            'opacity': 0.5
        },
        'type': 'scatter3d',
        'showscale': False
    }
}
# plot it:
wp.plot(dataPlotly)

# UPDATE ONLY LAYOUT:
dataPlotlyConfig = {
    'figureConfiguration': {
        'scene': {
            'xaxis': {'range': [-1, 1]},
            'yaxis': {'range': [-2, 2]},
            'zaxis': {'range': [-3, 3]},
            'aspectmode': 'manual',
            'aspectratio': {
                'x': 1,
                'y': 1,
                'z': 1,
            }
        }
    }
}
# MAKE SURE TO SELECT PLOT!
wp.plot(dataPlotlyConfig)

# PLOT AND LAYOUT!
dataFigureAndConfig = {
    'figure': {
        'x': np.random.rand(1, npts).flatten().tolist(),
        'y': np.random.rand(1, npts).flatten().tolist(),
        'z': np.random.rand(1, npts).flatten().tolist(),
        'mode': 'markers',
        'marker': {
            'size': 12,
            'line': {
                'color': 'rgba(217, 217, 217, 0.14)',
                'width': 0.5
            },
            'opacity': 0.5
        },
        'type': 'scatter3d',
        'showscale': False
    },
    'figureConfiguration': {
        'scene': {
            'xaxis': {'range': [-1, 1]},
            'yaxis': {'range': [-2, 2]},
            'zaxis': {'range': [-3, 3]},
            'aspectmode': 'manual',
            'aspectratio': {
                'x': 1,
                'y': 1,
                'z': 1,
            }
        }
    }
}
wp.plot(dataFigureAndConfig)
```

### Displaying Raw HTML

```
import numpy as np
import time
from webplot import webplot

# Create visualizer object:
wp = webplot()

npts = 500
# create plotly data object:
dataHtml= {
    'other': {
        'html': '<P><h1>MY RAW HTML GOES IN HERE</h1> </p'
    }
}
# plot it:
wp.plot(dataHtml)
```