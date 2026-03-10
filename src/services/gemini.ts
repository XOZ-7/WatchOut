import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const SYSTEM_INSTRUCTION = `You are a medical misinformation detection expert for the "WatchOut" system. 
Your task is to analyze medical claims, text, or images and determine if they are misinformation.

STRICT RULES:
1. If the user asks anything NOT related to medical topics (diseases, treatments, vaccines, drugs, etc.), respond ONLY with: "Sorry, I can only assist with medical-specific queries."
2. For medical queries, you MUST return a JSON object with the following structure:
{
  "flag": "Misinformation" | "Verified" | "Suspicious",
  "confidenceScore": number (0-100),
  "explanation": "A concise summary of the finding",
  "reasoning": "Detailed analysis and evidence"
}
3. Be objective and rely on established medical consensus.
4. If an image is provided (like a prescription or lab report), check for signs of tampering or inconsistent medical data.`;

export async function analyzeMedicalContent(content: string, imageBase64?: string): Promise<AnalysisResult | string> {
  const model = "gemini-3-flash-preview";
  
  const parts: any[] = [{ text: content || "Analyze this medical content." }];
  
  if (imageBase64) {
    parts.push({
      inlineData: {
        mimeType: "image/jpeg",
        data: imageBase64.split(',')[1] || imageBase64
      }
    });
  }

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ parts }],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            flag: { type: Type.STRING, enum: ["Misinformation", "Verified", "Suspicious"] },
            confidenceScore: { type: Type.NUMBER },
            explanation: { type: Type.STRING },
            reasoning: { type: Type.STRING }
          },
          required: ["flag", "confidenceScore", "explanation", "reasoning"]
        }
      }
    });

    const text = response.text;
    if (text.includes("Sorry, I can only assist with medical-specific queries")) {
      return "Sorry, I can only assist with medical-specific queries.";
    }

    try {
      return JSON.parse(text) as AnalysisResult;
    } catch (e) {
      console.error("Failed to parse Gemini response as JSON", text);
      return {
        flag: "Suspicious",
        confidenceScore: 50,
        explanation: "Could not parse detailed analysis.",
        reasoning: text
      };
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}
