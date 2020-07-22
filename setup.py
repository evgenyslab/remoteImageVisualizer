from distutils.core import setup

setup(
    name='remoteImageVisualizer',
    packages=['remoteImageVisualizer'],
    version='0.1',
    description='Remote Image Visualization toolbox',
    author='E.nuger',
    author_email='',
    url='https://github.com/evgenyslab/remoteImageVisualizer/',
    keywords=[],
    classifiers=[],
    requires=[ 'numpy',
                'PyTurboJPEG'
                'msgpack',
                'websockets',
                'uWebSockets']
)