import os
import time
from flask_cors import CORS, cross_origin
from flask import Flask, flash, request, redirect, url_for
from werkzeug.utils import secure_filename
from dotenv import load_dotenv
from flask_socketio import SocketIO, emit
import inference

load_dotenv()

UPLOAD_FOLDER = os.path.join(os.getcwd(), 'temp')
ALLOWED_EXTENSIONS = {'mp4'}

app = Flask(__name__)
CORS(app)
sio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@sio.event(namespace='/result')
def connect():
    print('A connection was established on WS')

@sio.event(namespace='/result')
def disconnect():
    print('Connection dropped from WS')

@app.route('/')
def hello():
    return "Crackle AI server successfully started"

@sio.event(namespace='/result')
def infer(payload):
    data = payload['data']
    emit('test', {'data': 'test'})
    if not data:
        return {'status': 'error', 'message': 'No JSON body found'}
    
    if 'filename' not in data.keys():
        return {'status': 'error', 'message': 'filename is required field'}

    filename = data['filename']

    if filename and allowed_file(filename):
        
        filename = secure_filename(filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)

        if os.path.exists(filepath):
            emit('processing', {'message': 'Extracting audio from video'}, namespace='/result')
            audio_path, size = inference.convertToWav(filepath)
            emit('processing_done', {'message': 'Splitting audio into chunks','total_length': size}, namespace='/result')
            chunks, timestamps = inference.create_audio_chunks(audio_path)
            emit('chunking_done', {'message': 'Generating transcript for each chunk','chunks': len(chunks)}, namespace='/result')
            transcript = []
            idx = 1
            for chunk in chunks:
                result = inference.retry_query_asr(chunk)
                emit('asr_status', {'current': idx}, namespace='/result')
                content = result[1]['text']
                transcript.append(content)
                idx += 1

            emit('asr_done', {'message': 'Segmenting transcript into topics'}, namespace='/result')
            topics, topic_timestamps = inference.topic_segmentation(transcript, timestamps=timestamps)
            emit('segmentation_done', {'message': 'Giving suitable name to topics','topics': len(topics)}, namespace='/result')

            output = []
            idx = 0
            for topic in topics:
                title = inference.retry_query_headline(topic)[1]['generated_text']
                emit('naming_status', {'current': idx+1}, namespace='/result')
                output.append({'start': topic_timestamps[idx], 'topic': title, 'content': topic})
                idx += 1

            text = ' '.join(transcript)
            emit('naming_done', {'message': 'Generating suitable title for video'}, namespace='/result')
            headline = inference.retry_query_headline(text)[1]['generated_text']
            emit('done', {'message': 'Succesfully processed the video', 'data': {'headline': headline, 'total_length': size, 'topics': output}}, namespace='/result')
            # return {'status': 'success', 'data': {'headline': headline, 'total_length': size, 'topics': output}}

        return {'status': 'error', 'message': 'File not found. Upload the video again'}


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
        return {'status': 'success', 'message': 'File uploaded successfully', 'filename': f'{currtime}_{filename}'}

    return {'status': 'error', 'message': 'File not allowed'}

if __name__ == "__main__":
    sio.run(app, debug=True)