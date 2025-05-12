from fastapi import FastAPI, UploadFile, File
import uvicorn
from assistant import PromptAssistant, extract_base64_from_image
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Thêm CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Cho phép tất cả các origins
    allow_credentials=True,
    allow_methods=["*"],  # Cho phép tất cả các methods
    allow_headers=["*"],  # Cho phép tất cả các headers
)

prompt_assistant = PromptAssistant()

@app.post("/api/create/image")
async def create_image(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        image_base64 = extract_base64_from_image(contents)
        
        if not image_base64:
            return {"error": "Failed to process image"}
        extracted_text = prompt_assistant.extract_text_from_image(image_base64)
        return {"text": extracted_text}
    except Exception as e:
        print(f"Error processing image: {str(e)}")
        return {"error": str(e)}

@app.get("/")
async def root():
    return {"message": "AI Service is running"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8888, reload=True)