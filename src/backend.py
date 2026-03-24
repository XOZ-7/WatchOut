from fastapi import FastAPI
from pydantic import BaseModel

import torch
import torch.nn.functional as F

from transformers import pipeline
from transformers import BertTokenizer, BertForSequenceClassification

import pickle
from fastapi.middleware.cors import CORSMiddleware

from google import genai
import json, re

model="gemini-1.5-flash-latest"
client = genai.Client(api_key="AIzaSyCL2qCibeeCKkmFhsDgON1YGm8PS6hOgxA")


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

@app.post("/explain")
def explain(data: Query):
    claim = data.query

    prompt = f"""
    You are a medical fact-checking assistant.

    Analyze the claim:
    "{claim}"

    Provide:
    1. A clear explanation (2–4 sentences)
    2. Say if it's valid or misinformation
    3. Give 2 reliable sources (WHO, CDC, etc.)

    Return ONLY JSON:
    {{
        "reasoning": "...",
        "sources": [
            {{"title": "...", "url": "..."}},
            {{"title": "...", "url": "..."}}
        ]
    }}
    """

    response = client.models.generate_content(
        model="gemini-1.5-flash",  # ✅ NOW this works
        contents=prompt,
    )

    import json, re

    text = response.text

    try:
        cleaned = re.sub(r"```json|```", "", text).strip()
        result = json.loads(cleaned)
    except:
        result = {
            "reasoning": text,
            "sources": []
        }

    return result
