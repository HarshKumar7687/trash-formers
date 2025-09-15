import os
import warnings
import logging

# Suppress all warnings
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
warnings.filterwarnings('ignore')
logging.getLogger('tensorflow').setLevel(logging.ERROR)


from flask import Flask, request, jsonify
from flask_cors import CORS  # Add this import
import numpy as np
from PIL import Image
import json
import os
import tensorflow as tf
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)  # Add CORS support

app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024
app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg', 'gif', 'bmp'}

# Create upload directory if it doesn't exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Load model and class mapping
try:
    model = tf.keras.models.load_model('waste_model.h5')
    print("✅ Model loaded successfully")

    with open('class_mapping.json', 'r') as f:
        class_mapping = json.load(f)
    class_mapping = {int(k): v for k, v in class_mapping.items()}
    print("✅ Class mapping loaded successfully")
    config = {'img_size': 224}

except Exception as e:
    print(f"❌ Error loading model files: {e}")
    model = None
    class_mapping = {}
    config = {'img_size': 224}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

def preprocess_image(image):
    image = image.resize((config['img_size'], config['img_size']))
    img_array = np.array(image) / 255.0
    img_array = np.expand_dims(img_array, axis=0)
    return img_array

def map_to_waste_category(original_class, confidence, all_predictions):
    waste_mapping = {
        'bio-degradable': ['paper', 'cardboard', 'organic'],
        'plastic': ['plastic'],
        'e-waste': ['e-waste'],
        'other': ['metal', 'glass']
    }

    if confidence < 0.24:
        return 'hazardous', confidence

    original_class_lower = original_class.lower()

    for waste_category, original_classes in waste_mapping.items():
        for orig_class in original_classes:
            if orig_class in original_class_lower:
                return waste_category, confidence

    return 'other', confidence

@app.route('/health', methods=['GET'])  # Add health endpoint
def health_check():
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None,
        'service': 'waste-classification-ml'
    })

@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['file']

    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    if file and allowed_file(file.filename):
        try:
            filename = secure_filename(file.filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)

            image = Image.open(filepath).convert('RGB')
            img_array = preprocess_image(image)

            if model:
                predictions = model.predict(img_array)
                predicted_class_idx = np.argmax(predictions, axis=1)[0]
                confidence = float(np.max(predictions))
                original_class = class_mapping.get(predicted_class_idx, "Unknown")

                waste_category, final_confidence = map_to_waste_category(
                    original_class, confidence, predictions[0]
                )

                os.remove(filepath)

                return jsonify({
                    'success': True,
                    'original_class': original_class,
                    'waste_category': waste_category,
                    'confidence': round(final_confidence * 100, 2),
                    'all_predictions': predictions[0].tolist(),
                    'all_classes': list(class_mapping.values())
                })
            else:
                return jsonify({'error': 'Model not loaded'}), 500

        except Exception as e:
            if os.path.exists(filepath):
                os.remove(filepath)
            return jsonify({'error': str(e)}), 500

    return jsonify({'error': 'Invalid file type'}), 400

@app.route('/test', methods=['GET'])  # Add simple test endpoint
def test():
    return jsonify({'message': 'ML service is working!'})

@app.route('/', methods=['GET'])
def home():
    return jsonify({
        'message': 'Waste Classification API is running!',
        'endpoints': {
            'health_check': 'GET /health',
            'test': 'GET /test', 
            'predict': 'POST /predict (with image file)'
        },
        'status': 'healthy',
        'model_loaded': model is not None
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=False)