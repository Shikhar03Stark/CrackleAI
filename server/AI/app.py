import os
import time
from flask_cors import CORS, cross_origin
from flask import Flask, flash, request, redirect, url_for
from werkzeug.utils import secure_filename

UPLOAD_FOLDER = os.path.join(os.getcwd(), 'server', 'AI', 'temp')
ALLOWED_EXTENSIONS = {'mp4'}

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def hello():
    return "Crackle AI server successfully started"

@app.route('/upload', methods=['POST'])
@cross_origin()
def upload_file():
    if 'file' not in request.files:
        # flash('No file part')
        return {'status': 'error', 'message': 'No file part'}
    file = request.files['file']

    if file and file.filename == '':
        # flash('No selected file')
        return {'status': 'error', 'message': 'No selected file'}

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        currtime = str(int(round(time.time() * 1000)))
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], f'{currtime}_{filename}'))
        return {'status': 'success', 'message': 'File uploaded successfully'}

    return {'status': 'error', 'message': 'File not allowed'}

if __name__ == "__main__":
    app.run()