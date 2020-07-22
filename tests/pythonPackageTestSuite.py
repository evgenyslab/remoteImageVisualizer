#!/bin/python3

import unittest
from pythonPackage.pythonPackage import pythonPackage
from pythonPackage.utilities.utilities import utilityFunctionA, utilityToolKit


class TestModule(unittest.TestCase):
    def test_module(self):
        obj = pythonPackage()
        # run assertion:
        self.assertEqual(1, 1)



if __name__ == '__main__':
    unittest.main()
