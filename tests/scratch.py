#%% NEWWWWW
from uWebSockets import Server
import numpy as np
import msgpack
from turbojpeg import TurboJPEG
import time
jpeg = TurboJPEG()

s = Server(7777)
s.run()

npts = 500

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

s.sendStringAsBinary(msgpack.packb(dataPlotly))

dataPlotlyConfig = {
    'figureConfiguration': {
            'scene': {
                'xaxis': {'range': [-1, 1]},
                'yaxis': {'range': [-2, 2]},
                'zaxis': {'range': [-3, 3]},
                'aspectmode':'manual',
                'aspectratio':{
                    'x': 1,
                    'y': 1,
                    'z': 1,
                }
            }
    }
}
s.sendStringAsBinary(msgpack.packb(dataPlotlyConfig))

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
                'aspectmode':'manual',
                'aspectratio':{
                    'x': 1,
                    'y': 1,
                    'z': 1,
                }
            }
    }
}
s.sendStringAsBinary(msgpack.packb(dataFigureAndConfig))


for _ in range(100):
    img = ((np.random.rand(1000, 1000, 3)) * 256).astype(np.uint8)
    dataImage = {
        'image': jpeg.encode(img, quality=80)
    }

    s.sendStringAsBinary(msgpack.packb(dataImage))
    time.sleep(0.01)


import numpy as np
import msgpack
from turbojpeg import TurboJPEG
import time
from webplot.webplot import webplot

wp = webplot()
for _ in range(100):
    img = ((np.random.rand(1000, 1000, 3)) * 256).astype(np.uint8)
    wp.show(img)