#!/bin/python3

import unittest
import numpy as np
import time
from webplot import webplot

class TestModule(unittest.TestCase):
    def testPlot(self):
        wp = webplot()

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
        # MAKE SURE TO SELECT PLOT!
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

        # IMAGES:
        for _ in range(100):
            img = ((np.random.rand(1000, 1000, 3)) * 256).astype(np.uint8)
            wp.show(img)
            time.sleep(0.01)


if __name__ == '__main__':
    unittest.main()
