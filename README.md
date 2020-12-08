# berlinerluft
Repository for FH Potsdam Mapping Cities project

## Set up Machine Learning pipeline to analyze (Youtube) comments

How to set up the Jupyter notebook:

Setting up Jupyter:
Install Anaconda: https://www.anaconda.com/products/individual
- Anaconda is is a distribution of python and R optimized for scientific calculations
- Jupyter Notebooks can be installed via Anaconda

Create an anaconda environment with python 3.6:
conda create -n [environment name] python=3.6

Deactivate base environment:
conda deactivate

Activate your environment
conda activate [environment name]

Install Jupiter Lab
conda install -c conda-forge jupyterlab
￼
Start jupyter lab:
jupyter lab

It should start in the browser. If not, just follow the link in the terminal.

All other dependecies will be installed from within the notebook.

Open the code from src folder in jupyter lab and modify it to load Twitter data instead of Youtube comments.
