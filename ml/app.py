from flask import Flask, request, jsonify, render_template
import numpy as np
from PIL import Image
import json
import os
import tensorflow as tf
from werkzeug.utils import secure_filename

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16 MB max file size
app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg', 'gif', 'bmp'}

# Create upload directory if it doesn't exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Load model and class mapping
try:
    model = tf.keras.models.load_model('waste_model.h5')
    print("✅ Model loaded successfully")

    with open('class_mapping.json', 'r') as f:
        class_mapping = json.load(f)
    # Convert keys to int
    class_mapping = {int(k): v for k, v in class_mapping.items()}
    print("✅ Class mapping loaded successfully")

    # Set image size (your model was trained on 224x224 images)
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
    """Preprocess the image for model prediction"""
    image = image.resize((config['img_size'], config['img_size']))
    img_array = np.array(image) / 255.0  # normalize
    img_array = np.expand_dims(img_array, axis=0)
    return img_array


def map_to_waste_category(original_class, confidence, all_predictions):
    """
    Map the original prediction to broader waste categories
    """
    waste_mapping = {
        'bio-degradable': ['paper', 'cardboard', 'organic'],
        'plastic': ['plastic'],
        'e-waste': ['e-waste'],
        'other': ['metal', 'glass']
    }

    if confidence < 0.24:  # low confidence threshold
        return 'hazardous', confidence

    original_class_lower = original_class.lower()

    for waste_category, original_classes in waste_mapping.items():
        for orig_class in original_classes:
            if orig_class in original_class_lower:
                return waste_category, confidence

    return 'other', confidence


@app.route('/')
def index():
    return render_template('index.html')


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
                    'confidence': round(final_confidence * 100, 2),  # %
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


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)