from flask import Flask, request, jsonify
import tensorflow as tf
import numpy as np
from keras.utils import load_img, img_to_array
from io import BytesIO

app = Flask(__name__)

# Load the model using TFSMLayer
model = tf.keras.layers.TFSMLayer("SkinSenseModel", call_endpoint="serve")

# List of 25 class labels
class_labels = [
    "Acne",
    "Actinic_Keratosis",
    "Benign_tumors",
    "Bullous",
    "burn_1st",
    "burn_2nd",
    "burn_3rd",
    "Candidiasis",
    "DrugEruption",
    "Eczema",
    "Infestations_Bites",
    "Lichen",
    "Lupus",
    "Moles",
    "Psoriasis",
    "Rosacea",
    "Seborrh_Keratoses",
    "SkinCancer",
    "Sun_Sunlight_Damage",
    "Tinea",
    "Unknown_Normal",
    "Vascular_Tumors",
    "Vasculitis",
    "Vitiligo",
    "Warts"
]

@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    img_file = request.files['file']

    try:
        # Wrap the uploaded file in BytesIO for load_img
        img = load_img(BytesIO(img_file.read()), target_size=(224, 224))
        img_array = img_to_array(img)
        img_array = np.expand_dims(img_array, axis=0) / 255.0

        predictions = model(img_array)
        predicted_index = np.argmax(predictions[0])
        predicted_label = class_labels[predicted_index]
        confidence = float(predictions[0][predicted_index].numpy())

        return jsonify({
            'predicted_index': int(predicted_index),
            'predicted_label': predicted_label,
            'confidence': confidence
        })

    except Exception as e:
        return jsonify({'error': f'Failed to process image: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002)
