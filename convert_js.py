import tensorflow as tf
from keras.models import save_model

model_path = "./checkpoint/model_20230911-104626"
model = tf.keras.models.load_model(model_path)

save_model(model, "best_model.h5", save_format="h5")
