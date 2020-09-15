from setuptools import setup, find_packages


setup(
    name='webplot',
    packages=['webplot', 'webplot.web'],
    version='0.5',
    description='Remote Image Visualization toolbox',
    author='E.nuger',
    author_email='',
    url='https://github.com/evgenyslab/webplot/',
    keywords=[],
    classifiers=[],
    package_data={'': ['*.js', '*.html']},
    include_package_data=True,

)