from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.json
    image_url = data.get('imageUrl')

    # Dummy logic for now
    result = {
        "diagnosis": "Dry skin",
        "confidence": 88,
        "recommendations": "Use moisturizing lotion daily and avoid hot water."
    }

    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True, port=5001)
