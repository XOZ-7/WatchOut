from fastapi import FastAPI
from pydantic import BaseModel

import torch
import torch.nn.functional as F
import tensorflow as tf

from transformers import BertTokenizer, BertForSequenceClassification
from tensorflow.keras.preprocessing.sequence import pad_sequences
import pickle
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow all (for development)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- LOAD MODELS ---------------- #

# BioBERT
tokenizer = BertTokenizer.from_pretrained("biobert_fact_model")
bert_model = BertForSequenceClassification.from_pretrained("biobert_fact_model")

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
bert_model.to(device)

# RNN
rnn_model = tf.keras.models.load_model("tone_model.h5")

# ⚠️ IMPORTANT: Load tokenizer used during training
with open("tokenizer_rnn.pkl", "rb") as f:
    tokenizer_rnn = pickle.load(f)

tone_labels = ["negative","neutral","positive"]

# ---------------- REQUEST FORMAT ---------------- #

class Query(BaseModel):
    query: str

# ---------------- FUNCTIONS ---------------- #

def check_claim(claim):
    inputs = tokenizer(claim, return_tensors="pt", truncation=True, padding=True)
    inputs = {k: v.to(device) for k, v in inputs.items()}

    outputs = bert_model(**inputs)
    probs = torch.softmax(outputs.logits, dim=1)

    pred = torch.argmax(probs).item()
    confidence = probs[0][pred].item()

    result = "VALID" if pred == 0 else "INVALID"
    return result, confidence


def detect_tone(text):
    seq = tokenizer_rnn.texts_to_sequences([text])
    padded = pad_sequences(seq, maxlen=100)

    pred = rnn_model.predict(padded)
    tone_index = pred.argmax()

    return tone_labels[tone_index], float(pred[0][tone_index])


# ---------------- API ---------------- #

@app.post("/analyze")
def analyze(data: Query):
    claim = data.query

    validity, confidence = check_claim(claim)
    tone, tone_conf = detect_tone(claim)

    return {
        "biobert": validity,
        "confidence": confidence,
        "tone": tone,
        #"tone_confidence": tone_conf
    }