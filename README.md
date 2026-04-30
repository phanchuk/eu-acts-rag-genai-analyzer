# 📚 Study Project — EU Acts RAG GenAI Analyzer

A Retrieval-Augmented Generation (RAG) system designed to analyze and answer questions based on EU regulations (e.g. DSA, AI Act, Data Act etc).

The project focuses on building an end-to-end pipeline: from document ingestion and embedding to context-aware answer generation.

---

## 💡 Key Features
- Semantic search over EU legal documents
- RAG-based question answering using LLMs
- Automated document ingestion from Google Drive
- Context-aware responses grounded in source material
- Modular workflow for:
  - Embedding pipeline
  - Retrieval
  - Answer generation

---

## 🛠 Tech Stack
- Lovable (UI layer / prototyping)
- Elestio (cloud hosting)
- n8n (workflow orchestration)
  - Embedding pipeline
  - RAG query pipeline
- Google Cloud
  - Google Drive API
- Google Drive (document storage)
- OpenAI API (embeddings + generation)

---

## ⚙️ System Architecture (High-Level)
1. **Document Ingestion**
   - Files uploaded to Google Drive
   - Triggered via n8n workflow

2. **Preprocessing & Embedding**
   - Text extraction and chunking
   - Metadata enrichment
   - Embeddings generated via OpenAI
   - Stored in vector database

3. **RAG Query Flow**
   - User query → embedding
   - Semantic retrieval (top-K chunks)
   - Context injection into LLM
   - Final grounded answer

---

## 🧠 Product Thinking
- Focus on **trustworthy AI outputs** (grounded in legal text)
- Designed for **scalability** with modular pipelines
- Emphasis on **retrieval quality** (chunking, metadata, query optimization)
- Built as an experimentation platform for:
  - Prompt engineering
  - RAG tuning
  - Evaluation of answer quality

---

## 📸 Screenshots

### Embedding Pipeline Improvements (Before vs After)
<img width="1699" height="903" alt="Before-After Embedding Extra File" src="https://github.com/user-attachments/assets/04169942-d5b7-44b7-a72d-a2239be8891a" />

### RAG Answer Flow (n8n)
<img width="964" height="300" alt="RAG answer n8n" src="https://github.com/user-attachments/assets/c9117e70-7236-4ee1-a442-00042405d0d4" />

### RAG Embedding Flow (n8n)
<img width="806" height="368" alt="RAG EMBEDDING n8n" src="https://github.com/user-attachments/assets/c5288349-8e08-4801-8780-a292b3ef83bf" />

---

## 📌 Notes
This project emphasizes practical implementation of RAG systems, focusing on data quality, retrieval accuracy, and end-to-end orchestration rather than production-scale optimization.
