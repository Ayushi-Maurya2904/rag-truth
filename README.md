# 🛡️ RAG-Truth: Grounding & Hallucination Auditor

RAG-Truth is an AI-powered grounding auditor designed to detect and inspect hallucinations in RAG (Retrieval-Augmented Generation) systems. It breaks down AI-generated responses into atomic factual claims and verifies each claim against provided source documents.

---

## ✨ Features

- **Atomic Claim Extraction:** Automatically decomposes AI answers into individual factual assertions.
- **Evidence Lens:** Pinpoints the exact sentence in the source document supporting or contradicting each claim.
- **3-Tier Grounding Status:**
  - 🟢 **Supported:** Fully backed by source documentation.
  - 🟡 **Partially Supported:** Mostly accurate, but omits key conditions or nuances.
  - 🔴 **Unsupported:** Hallucinated or directly contradicts source material.
- **Faithfulness Scorecard:** Provides an overall percentage score for response reliability.

---

## 🛠️ Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, Lucide Icons
- **Backend:** Node.js, Express
- **AI Core:** Google Gemini API (`gemini-2.5-flash`)

---

## 🚀 Quick Start (Local Setup)

### 1. Prerequisites
Ensure you have **Node.js** installed.

### 2. Backend Setup
```bash
cd server
npm install
