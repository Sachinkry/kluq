# python-service/server.py
from fastapi import FastAPI, UploadFile, File
from docling.document_converter import DocumentConverter
from docling.datamodel.base_models import DocumentStream  # <--- IMPORT THIS
import uvicorn
import io

app = FastAPI()
converter = DocumentConverter()

@app.post("/parse")
async def parse_pdf(file: UploadFile = File(...)):
    # Read file to buffer
    content = await file.read()
    
    # FIX: Wrap BytesIO in DocumentStream with a filename
    # Docling uses the filename extension (e.g., .pdf) to determine the format
    buf = io.BytesIO(content)
    source = DocumentStream(name=file.filename or "document.pdf", stream=buf)
    
    # Convert using the wrapped source
    result = converter.convert(source)
    
    # Export to Markdown
    md_output = result.document.export_to_markdown()
    
    return {"text": md_output}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)