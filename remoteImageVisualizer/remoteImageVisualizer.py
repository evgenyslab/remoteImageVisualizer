
from .utilities.utilities import utilityFunctionA, utilityToolKit

class pythonPackage:
    def __init__(self):
        self.name = "pythonPackage"
        self.utilityToolKit = utilityToolKit()

    def doWork(self):
        utilityFunctionA()
