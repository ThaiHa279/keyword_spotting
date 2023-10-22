import librosa
import librosa.display
import matplotlib.pyplot as plt

def show_data(file_path):
    data, sampling_rate = librosa.load(file_path)
    plt.figure(figsize=(12, 4))
    librosa.display.waveshow(data, sr=sampling_rate)

show_data("recorded_audio.wav")