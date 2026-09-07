import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

app.post('/api/audit', async (req, res) => {
  try {
    const { sourceDoc, aiAnswer, query } = req.body;

    if (!sourceDoc || !aiAnswer) {
      return res.status(400).json({ error: 'Source document and AI answer are required.' });
    }

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_actual_gemini_api_key_here') {
      console.warn("GEMINI_API_KEY missing or default. Returning fallback response.");
      return res.json({
        score: 67,
        totalClaims: 3,
        supportedCount: 1,
        partiallySupportedCount: 1,
        unsupportedCount: 1,
        claims: [
          {
            id: 1,
            claim: "Students need at least 75% attendance to qualify for exams and scholarships.",
            status: "supported",
            confidence: 98,
            sourceSentence: "Students must maintain at least 75% attendance to be eligible for the semester examinations and university scholarships.",
            explanation: "Direct match found in the source document regarding attendance percentage requirements."
          },
          {
            id: 2,
            claim: "Medical leave up to 10% can be approved by the Department Head.",
            status: "partially_supported",
            confidence: 75,
            sourceSentence: "Exceptional medical leave up to 10% can be granted by the Department Head upon submitting valid hospital documentation.",
            explanation: "Supported, but omits the mandatory condition of submitting valid hospital documentation."
          },
          {
            id: 3,
            claim: "Eligible students also receive a ₹2,000 monthly stipend.",
            status: "unsupported",
            confidence: 12,
            sourceSentence: null,
            explanation: "No supporting evidence found in the source document regarding a ₹2,000 monthly stipend."
          }
        ]
      });
    }

    const prompt = `
You are an expert AI Grounding & Hallucination Auditor.
Your job is to extract atomic, factual claims from an AI-generated answer and verify each claim against a provided Source Document.

Input:
SOURCE DOCUMENT:
"""
${sourceDoc}
"""

AI ANSWER TO VERIFY:
"""
${aiAnswer}
"""

OPTIONAL USER QUERY: "${query || 'N/A'}"

INSTRUCTIONS:
1. Break the AI Answer into individual, distinct factual claims.
2. For each claim, evaluate if it is supported by the Source Document.
3. Classify each claim as:
   - "supported": Fully grounded in source.
   - "partially_supported": Mostly grounded, but misses a condition or oversimplifies.
   - "unsupported": Information not present in source or directly contradicts it.
4. Extract the EXACT sentence from the Source Document supporting the claim (or set sourceSentence to null if unsupported).
5. Provide a brief explanation for the rating.

Return strictly structured JSON.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            claims: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.INTEGER },
                  claim: { type: Type.STRING },
                  status: { 
                    type: Type.STRING,
                    enum: ["supported", "partially_supported", "unsupported"]
                  },
                  confidence: { type: Type.INTEGER },
                  sourceSentence: { type: Type.STRING, nullable: true },
                  explanation: { type: Type.STRING }
                },
                required: ["id", "claim", "status", "confidence", "explanation"]
              }
            }
          },
          required: ["claims"]
        }
      }
    });

    const result = JSON.parse(response.text);

    const claims = result.claims || [];
    const totalClaims = claims.length;
    const supportedCount = claims.filter(c => c.status === 'supported').length;
    const partiallySupportedCount = claims.filter(c => c.status === 'partially_supported').length;
    const unsupportedCount = claims.filter(c => c.status === 'unsupported').length;

    const rawScore = totalClaims > 0 
      ? Math.round(((supportedCount + (partiallySupportedCount * 0.5)) / totalClaims) * 100) 
      : 0;

    return res.json({
      score: rawScore,
      totalClaims,
      supportedCount,
      partiallySupportedCount,
      unsupportedCount,
      claims
    });

  } catch (error) {
    console.error('Audit Error:', error);
    res.status(500).json({ error: 'Failed to process audit. Check server logs.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});