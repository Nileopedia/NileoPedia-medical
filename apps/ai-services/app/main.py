from fastapi import FastAPI

app = FastAPI(
    title="NileoPedia AI Services",
    description="AI/RAG services for medical knowledge platform",
    version="0.1.0"
)

@app.get("/health")
async def health_check():
    return {"status": "healthy"}