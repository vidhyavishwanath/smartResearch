from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import uuid
from werkzeug.utils import secure_filename
from parser import parseAndSummarizePdf
from databaseQuery import saveSummary 
import asyncio

app = Flask(__name__)
CORS(app, origins="*", supports_credentials=False)

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf', 'txt', 'doc', 'docx'}
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def processWithParser(file_path, file_extension):
    """Process file and return summary"""
    try:
        if file_extension == 'pdf':
            key = os.getenv("OPENAI_API_KEY")
            result = asyncio.run(processWithParser(file_path, file_extension))
            summary_text = result.get('global_summary', '')
        else:
            # For txt/docx, just read text content
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                summary_text = f.read()[:1000]  # optional: first 1000 chars
        return {'success': True, 'summary': summary_text}
    except Exception as e:
        return {'success': False, 'summary': '', 'error': str(e)}

@app.route('/api/upload', methods=['POST'])
def uploadFile():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if not allowed_file(file.filename):
        return jsonify({'error': 'File type not allowed'}), 400
    
    try:
        file_id = str(uuid.uuid4())
        filename = secure_filename(file.filename)
        file_extension = filename.rsplit('.', 1)[1].lower()
        unique_filename = f"{file_id}.{file_extension}"
        tempPath = os.path.join(UPLOAD_FOLDER, unique_filename)
        file.save(temp_path)
        
        processing_result = processWithParser(tempPath, file_extension)
        
        if processing_result['success'] and processing_result['summary']:
            saveSummary(filename, processing_result['summary'])
        

        os.remove(tempPath)
        
        return jsonify({
            'success': True,
            'fileId': file_id,
            'filename': filename,
            'processing_result': processing_result
        })
        
    except Exception as e:
        return jsonify({'error': f'Upload failed: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)