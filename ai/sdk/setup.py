from setuptools import setup, find_packages

setup(
    name='sesim-ai-sdk',
    version='0.1.0',
    description='SDK for interacting with SESIM AI service',
    author='sesimS109',
    author_email='qowlgo00@email.com',
    url='http://www.sesim.site',
    packages=find_packages(),
    install_requires=[
        'requests>=2.0.0'
    ],
    python_requires='>=3.7',
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
    ]
)