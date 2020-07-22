#!/bin/python3

import unittest
from remoteImageVisualizer.remoteImageVisualizer import remoteImageVisualizer as riv
import numpy as np



class TestModule(unittest.TestCase):
    def test_module(self):
        visualizer = riv()

        image = ((np.random.rand(200,400,3))*256).astype(np.uint8)

        visualizer.show(image)

        # run assertion:
        self.assertEqual(1, 1)



if __name__ == '__main__':
    unittest.main()
