from flask import Flask, request, jsonify
import numpy as np
from PIL import Image
import tflite_runtime.interpreter as tflite
from io import BytesIO

app = Flask(__name__)

# Load TFLite model
interpreter = tflite.Interpreter(model_path="SkinSenseModel.tflite")
interpreter.allocate_tensors()

# Get input and output details
input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()

# List of 25 class labels
class_labels = [
    "Acne", "Actinic_Keratosis", "Benign_tumors", "Bullous", "burn_1st", "burn_2nd", "burn_3rd",
    "Candidiasis", "DrugEruption", "Eczema", "Infestations_Bites", "Lichen", "Lupus", "Moles",
    "Psoriasis", "Rosacea", "Seborrh_Keratoses", "SkinCancer", "Sun_Sunlight_Damage", "Tinea",
    "Unknown_Normal", "Vascular_Tumors", "Vasculitis", "Vitiligo", "Warts"
]

@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    img_file = request.files['file']

    try:
        img = Image.open(BytesIO(img_file.read())).convert("RGB")
        img = img.resize((224, 224))
        img_array = np.expand_dims(np.array(img) / 255.0, axis=0).astype(np.float32)

        interpreter.set_tensor(input_details[0]['index'], img_array)
        interpreter.invoke()
        output_data = interpreter.get_tensor(output_details[0]['index'])

        predicted_index = int(np.argmax(output_data[0]))
        predicted_label = class_labels[predicted_index]
        confidence = float(output_data[0][predicted_index])

        return jsonify({
            'predicted_index': predicted_index,
            'predicted_label': predicted_label,
            'confidence': confidence
        })

    except Exception as e:
        return jsonify({'error': f'Failed to process image: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002)
