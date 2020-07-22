from setuptools import setup, find_packages


setup(
    name='remoteimagevisualizer',
    packages=['remoteimagevisualizer', 'remoteimagevisualizer.web'],
    version='0.1',
    description='Remote Image Visualization toolbox',
    author='E.nuger',
    author_email='',
    url='https://github.com/evgenyslab/remoteImageVisualizer/',
    keywords=[],
    classifiers=[],
    package_data={'': ['*.js', '*.html']},
    # package_data={'remoteimagevisualizer/web': ['web/remoteImageVisualizer.html',
    #                                             'web/remoteImageVisualizerBundle.js']},
    # package_data={'remoteimagevisualizer': ['web/*']},
    # data_files=[('web', ['web/remoteImageVisualizer.html', 'web/remoteImageVisualizerBundle.js'])],
    include_package_data=True,
    # requires=[  'numpy',
    #             'PyTurboJPEG',
    #             'msgpack',
    #             'uWebSockets',
    #             'opencv']
)