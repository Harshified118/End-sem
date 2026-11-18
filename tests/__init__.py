import warnings

# Suppress sklearn parallel deprecation/config user warnings during test runs
warnings.filterwarnings("ignore", category=UserWarning, module="sklearn")
