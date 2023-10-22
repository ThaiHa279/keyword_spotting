# Import thư viện Flask
from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
import os
import time
import librosa
import librosa.display
import matplotlib.pyplot as plt

# Khởi tạo ứng dụng Flask
app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

# Định nghĩa route cho trang chủ
@app.route('/predict', methods=['POST'])
def predict():
    file = request.files['file']
    datetime = time.strftime("%Y%m%d-%H%M%S")
    path = "request_file"
    file_path = os.path.join(path, "audio_" + datetime + ".wav")
    file.save(file_path)
    show_data(file_path)
    return jsonify({"data": 'xin chào'})

def show_data(file_path):
    data, sampling_rate = librosa.load(file_path)
    plt.figure(figsize=(12, 4))
    librosa.display.waveshow(data, sr=sampling_rate)

# Chạy ứng dụng
if __name__ == '__main__':
    app.run(debug=True)
