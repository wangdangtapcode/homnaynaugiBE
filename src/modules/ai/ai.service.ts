import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import { spawn } from 'child_process';

@Injectable()
export class AiService {
  private readonly aiServicePath: string;

  constructor(
    private readonly configService: ConfigService,
  ) {
    // Đường dẫn đến thư mục AI (mặc định trong src/ai)
    this.aiServicePath = this.configService.get<string>('AI_SERVICE_PATH') || path.join(process.cwd(), 'src', 'ai');
  }

  /**
   * Trích xuất nguyên liệu từ hình ảnh bằng cách gọi trực tiếp assistant.py
   */
  async extractIngredientsFromImage(imageBuffer: Buffer): Promise<string[]> {
    try {
      if (!imageBuffer || imageBuffer.length === 0) {
        throw new Error('Buffer hình ảnh không hợp lệ hoặc trống');
      }

      // Đường dẫn tới script Python
      const assistantPath = path.join(this.aiServicePath, 'assistant.py');
      console.log(`Đang chạy Python từ: ${assistantPath}`);
      console.log(`Kích thước buffer hình ảnh: ${imageBuffer.length} bytes`);

      // Sử dụng spawn thay vì exec để có thể truyền buffer vào stdin
      return new Promise((resolve, reject) => {
        const pythonProcess = spawn('python', [assistantPath, '-']);
        let dataFromPython = '';
        let errorFromPython = '';

        // Ghi dữ liệu buffer hình ảnh vào stdin của Python process
        pythonProcess.stdin.write(imageBuffer);
        pythonProcess.stdin.end();

        // Lắng nghe dữ liệu từ stdout
        pythonProcess.stdout.on('data', (data) => {
          dataFromPython += data.toString();
        });

        // Lắng nghe lỗi từ stderr
        pythonProcess.stderr.on('data', (data) => {
          const errorMsg = data.toString();
          // Bỏ qua thông báo tải xuống từ Google API
          if (!errorMsg.includes('Downloading')) {
            errorFromPython += errorMsg;
          }
        });

        // Xử lý khi process kết thúc
        pythonProcess.on('close', (code) => {
          if (code !== 0) {
            console.error('Python error:', errorFromPython);
            reject(new Error(`Python process exited with code ${code}: ${errorFromPython}`));
          } else {
            try {
              const result = JSON.parse(dataFromPython.trim());
              if (result.error) {
                reject(new Error(result.error));
              } else {
                resolve(result.ingredients);
              }
            } catch (error) {
              reject(new Error(`Không thể phân tích dữ liệu từ Python: ${error.message}`));
            }
          }
        });

        // Xử lý khi có lỗi
        pythonProcess.on('error', (error) => {
          reject(new Error(`Không thể khởi động Python process: ${error.message}`));
        });
      });
    } catch (error) {
      console.error('Error in AI service:', error);
      throw new Error(`Không thể trích xuất nguyên liệu: ${error.message}`);
    }
  }
} 