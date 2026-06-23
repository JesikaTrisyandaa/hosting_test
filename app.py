from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import numpy as np
from PIL import Image
import io

app = Flask(__name__)
CORS(app)

model = tf.keras.models.load_model(r"model_akurasi72.h5", compile=False)

CLOUD_CLASSES = [
    "Altocumulus",
    "Altostratus",
    "Cumulonimbus",
    "Cirrocumulus",
    "Cirrus",
    "Cirrostratus",
    "Cumulus Fractus",
    "Cumulus",
    "Nimbostratus",
    "Stratocumulus",
    "Stratus"
]



@app.route("/predict", methods=["POST"])
def predict():
    file = request.files["image"]
    img = Image.open(io.BytesIO(file.read())).convert("RGB")
    img = img.resize((224, 224))

    arr = np.array(img).astype("float32") / 255.0
    arr = np.expand_dims(arr, axis=0)

    probs = model.predict(arr)[0]

    predictions = [
        {"class": CLOUD_CLASSES[i], "prob": float(probs[i])}
        for i in range(len(CLOUD_CLASSES))
    ]
    predictions = sorted(predictions, key=lambda x: x["prob"], reverse=True)

    return jsonify({"predictions": predictions})


if __name__ == "__main__":
    app.run(debug=True)

