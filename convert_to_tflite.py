import tensorflow as tf
from keras.layers import TFSMLayer
import numpy as np

# Load the model using TFSMLayer
model = TFSMLayer("SkinSenseModel", call_endpoint="serve")

# Create dummy input (batch of 1 RGB image, size 224x224)
dummy_input = tf.convert_to_tensor(np.random.rand(1, 224, 224, 3).astype(np.float32))

# Call the model with dummy input
output = model(dummy_input)

# Print input details
print("✅ INPUT SHAPE:", dummy_input.shape)
print("✅ INPUT DTYPE:", dummy_input.dtype)

# Print output details
print("✅ OUTPUT SHAPE:", output.shape)
print("✅ OUTPUT DTYPE:", output.dtype)
