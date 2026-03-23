from fastapi import FastAPI
from pydantic import BaseModel

import torch
import torch.nn.functional as F

from transformers import pipeline
from transformers import BertTokenizer, BertForSequenceClassification

import pickle
from fastapi.middleware.cors import CORSMiddleware

device = torch.device("cpu")

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
bert_model = BertForSequenceClassification.from_pretrained(
    "./biobert_fact_model",
    torch_dtype="auto",
    low_cpu_mem_usage=True
)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
bert_model.to(device)

tone_model = pipeline(
    "sentiment-analysis",
    model="distilbert-base-uncased-finetuned-sst-2-english"
)

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

    result = "Valid" if pred == 0 else "Invalid"
    return result, confidence


def detect_tone(text):
    result = tone_model(text)[0]

    label = result["label"]
    confidence = result["score"]

    if label == "POSITIVE":
        tone = "Positive"
    else:
        tone = "Negative"

    return tone, confidence

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
    #    "tone_confidence": tone_conf
    }
