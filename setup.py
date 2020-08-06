from setuptools import setup, find_packages


setup(
    name='webplot',
    packages=['webplot', 'webplot.web'],
    version='0.1',
    description='Remote Image Visualization toolbox',
    author='E.nuger',
    author_email='',
    url='https://github.com/evgenyslab/remoteImageVisualizer/',
    keywords=[],
    classifiers=[],
    package_data={'': ['*.js', '*.html']},
    include_package_data=True,

)