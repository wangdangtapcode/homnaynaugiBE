from google.generativeai import configure, GenerativeModel
import os
from dotenv import load_dotenv
import re

# image_extractor.py
import base64
from io import BytesIO
from PIL import Image

import sys
sys.stdout.reconfigure(encoding='utf-8')

def extract_base64_from_image(file_content, format='JPEG'):
    try:
        if file_content is None:
            print("Error: file_content is None")
            return None
            
        img = Image.open(BytesIO(file_content))
        if format.upper() == 'JPEG' and img.mode != 'RGB':
            img = img.convert('RGB')
        buffered = BytesIO()
        img.save(buffered, format=format)
        encoded_image = base64.b64encode(buffered.getvalue()).decode('utf-8')
        return encoded_image
    except Exception as e:
        print(f"Error extracting base64 from image: {e}")
        return None

# Thêm hàm xử lý file trực tiếp
def process_image_file(file_path):
    """
    Xử lý file ảnh từ đường dẫn và trả về danh sách nguyên liệu
    """
    try:
        with open(file_path, 'rb') as f:
            file_content = f.read()
        
        # Khởi tạo PromptAssistant
        assistant = PromptAssistant()
        
        # Trích xuất base64 từ file ảnh
        image_base64 = extract_base64_from_image(file_content)
        
        if not image_base64:
            return {"error": "Không thể xử lý hình ảnh"}
        
        # Trích xuất nguyên liệu từ ảnh
        ingredients_list = assistant.extract_text_from_image(image_base64)
        return {"ingredients": ingredients_list}
    except Exception as e:
        print(f"Lỗi khi xử lý ảnh: {str(e)}")
        return {"error": str(e)}

# Thêm hàm xử lý buffer trực tiếp
def process_image_buffer(buffer_data):
    """
    Xử lý buffer ảnh trực tiếp và trả về danh sách nguyên liệu
    """
    try:
        # Khởi tạo PromptAssistant  
        assistant = PromptAssistant()
        
        # Trích xuất base64 từ buffer
        image_base64 = extract_base64_from_image(buffer_data)
        
        if not image_base64:
            return {"error": "Không thể xử lý hình ảnh"}
        
        # Trích xuất nguyên liệu từ ảnh
        ingredients_list = assistant.extract_text_from_image(image_base64)
        return {"ingredients": ingredients_list}
    except Exception as e:
        print(f"Lỗi khi xử lý ảnh: {str(e)}")
        return {"error": str(e)}
            

load_dotenv()

prompt_assistant_cfg = {
    "model_type": "gemini-2.0-flash",
    "api_key": os.getenv("GEMINI_API_KEY")
}

model_type = prompt_assistant_cfg["model_type"]
api_key = prompt_assistant_cfg["api_key"]

IMAGE_EXTRACT_PROMPT = '''Extract and transcribe ALL ingredients listed or visible in the provided image with 100% accuracy.
Analyze the image thoroughly and capture every ingredient mentioned, including those in small or partially visible text.

Important Requirements:
- List all ingredients in the image in Vietnamese
- Extract ONLY ingredient names
- Maintain the original order and grouping as shown in the image
- Preserve diacritical marks for Vietnamese or other accented text
- If any part of an ingredient is unclear or unreadable, indicate with [unreadable]
- Do not include any commentary, explanations, or formatting that is not part of the image
- Output ONLY the list of ingredients, nothing else
'''

class PromptAssistant:
    def __init__(self):
        self.model = GenerativeModel(model_type.lower())
        self.cfg_model = configure(api_key=api_key)
    
    def _send_image_to_model(self, prompt, image_data):
        try:
            if image_data is None:
                raise ValueError("Image data is None or invalid")
            
            image_parts = [
                {"mime_type": "image/jpeg", "data": image_data},
                {"text": prompt}
            ]

            response = self.model.generate_content(
                image_parts,
                generation_config={
                    "top_k": 32,
                    "top_p": 0.95,
                    "temperature": 0.2,
                    "max_output_tokens": 2048
                }
            )
            return response.text
        except Exception as e:
            print(f"Error sending image to model: {e}")
            raise e
    
    def _to_python_list(self, text):
        return eval(text)
    
    def extract_text_from_image(self, image_data):
        if not image_data:
            raise ValueError("Không có dữ liệu hình ảnh hợp lệ")
        
        prompt = IMAGE_EXTRACT_PROMPT
        text_result = self._send_image_to_model(prompt, image_data)
        
        # Chuyển đổi chuỗi text thành danh sách Python và loại bỏ "- " ở đầu mỗi dòng
        ingredients_list = [ingredient.strip().lstrip('- ') for ingredient in text_result.split('\n') if ingredient.strip()]
        return ingredients_list

# Thêm hàm main để chạy trực tiếp
if __name__ == "__main__":
    import sys
    import json
    
    if len(sys.argv) > 1:
        # Nếu tham số đầu vào là '-', đọc buffer từ stdin
        if sys.argv[1] == '-':
            buffer_data = sys.stdin.buffer.read()
            result = process_image_buffer(buffer_data)
        else:
            # Nếu không, xử lý như bình thường với đường dẫn file
            file_path = sys.argv[1]
            result = process_image_file(file_path)
        
        # In kết quả dưới dạng JSON
        print(json.dumps(result))