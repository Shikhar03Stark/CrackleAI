import os
import time
import requests
import json
from dotenv import load_dotenv
from pydub import AudioSegment
from pydub.silence import split_on_silence
import numpy as np
from numpy import dot
from numpy.linalg import norm

load_dotenv()

def retry_query_asr(filename, retries=10, increments=2, max_wait=20):
    """
    Retires untill 200 response is recieved with geometrically increasing intervals
    Dies after threshold tries tries.
    """
    API_URL = "https://api-inference.huggingface.co/models/facebook/wav2vec2-large-960h-lv60-self"
    headers = {"Authorization": f"Bearer {os.getenv('HF_TOKEN')}"}
    req_count = 0
    wait_time = 1
    status = 0

    with open(filename, "rb") as f:
        data = f.read()

    while(req_count <= retries):
        response = requests.request("POST", API_URL, headers=headers, data=data)
        status = response.status_code
        print('ASR', status, response.content, f'wt = {wait_time}', f'rc = {req_count}')
        if status//100 == 2:
            return (response.status_code, json.loads(response.content.decode("utf-8")))
        if status//100 == 4:
            return (status, {'text': ''})
        #wait for next call
        print(f"Failed. waiting for {wait_time}s. ({req_count+1})")
        time.sleep(wait_time)
        wait_time *= increments
        wait_time = min(max_wait, wait_time)
        req_count += 1

    return (status, {'text': ''})

def retry_query_headline(input, retries=10, increments=2, max_wait=20):
    """
    Retires untill 200 response is recieved with geometrically increasing intervals
    Dies after threshold tries tries.
    """
    API_URL = "https://api-inference.huggingface.co/models/Michau/t5-base-en-generate-headline"
    headers = {"Authorization": f"Bearer {os.getenv('HF_TOKEN')}"}
    req_count = 0
    wait_time = 1
    status = 0


    while(req_count <= retries):
        response = requests.request("POST", API_URL, headers=headers, json={'inputs':input})
        status = response.status_code
        print('HEAD', status, response.content, f'wt = {wait_time}', f'rc = {req_count}')
        if status//100 == 2:
            return (status, response.json()[0])
        if status//100 == 4:
            return (status, {'generated_text': ''})
        #wait for next call
        print(f"Failed. waiting for {wait_time}s. ({req_count+1})")
        time.sleep(wait_time)
        wait_time *= increments
        wait_time = min(max_wait, wait_time)
        req_count += 1

    return (status, {'generated_text': ''})

def retry_query_similarity(source_sent, compare_sents, retries=10, increments=2, max_wait=20):
    API_URL = "https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2"
    headers = {"Authorization": f"Bearer {os.getenv('HF_TOKEN')}"}
    req_count = 0
    wait_time = 1
    status = 0

    while(req_count <= retries):
        response = requests.request("POST", API_URL, headers=headers, json={'inputs':{'source_sentence': source_sent, 'sentences': compare_sents}})
        status = response.status_code
        print('SIM', status, response.content, f'wt = {wait_time}', f'rc = {req_count}')
        if status//100 == 2:
            return (status, response.json()[0])
        if status//100 == 4:
            return (status, 0)
        #wait for next call
        print(f"Failed. waiting for {wait_time}s. ({req_count+1})")
        time.sleep(wait_time)
        wait_time *= increments
        wait_time = min(max_wait, wait_time)
        req_count += 1

    return (status, 0)

def convertToWav(filename):
    sound = AudioSegment.from_file(filename)
    basename, ext = ''.join(filename.split('.')[:-1]), filename.split('.')[-1]
    # basename = basename.replace('\\\\', '\\')
    sound.export(basename + '.wav', format='wav')
    return basename + '.wav', len(sound)

def create_audio_chunks(filename, duration_s=10):
    sound = AudioSegment.from_file(filename, format="wav")
    audio_chunks = split_on_silence(sound, min_silence_len=800, silence_thresh=-33)
    result = []
    timestamp = []
    chunk = 0
    duration = duration_s*1000 #milliseconds
    sz = 0
    for audio in audio_chunks:
        start = 0
        if chunk > 1000:
            break
        while start < len(audio):
            end = start + duration
            if end > len(audio):
                end = len(audio)
            chunk += 1
            exp_filename = filename.replace(".wav", "_chunk{0}.wav".format(chunk))
            chunk_sound = audio[start:end]
            if len(timestamp) == 0:
                timestamp.append(0)
                sz = end-start+1
            else:
                timestamp.append(timestamp[-1]+sz)
                sz = end-start+1
            # print("exporting", exp_filename)
            chunk_sound.export(exp_filename, format="wav")
            result.append(exp_filename)
            start = end
    return result, timestamp

def chunk_to_text(chunk_path, retries=10, increments=2, max_wait=20):
  return retry_query_asr(chunk_path, retries=retries, increments=increments, max_wait=max_wait)

def cosine_similarity(u, v):
  return dot(u, v)/(norm(u)*norm(v))


def weighted_avg(n, a, b):
  return (n*a + b)/(n+1)

def topic_segmentation(sentences, timestamps):
    # model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
    partitions = []
    topic_timestamps = []
    partition = ''
    start_idx = 0
    sent_idx = 0
    for sent in sentences:
        if len(partition) == 0:
            partition = sent
            start_idx = sent_idx
        else:
            # pos_sent = ' '.join([partition, sent])
            # cosine = cosine_similarity(part_emb, e)
            score = retry_query_similarity(partition, [sent])[1]
            if score > 0.20:
            #Extend partion
                partition = ' '.join([partition, sent])
                # part_emb = weighted_avg(len(partition), part_emb, e)
            else:
            #New Partition
                partitions.append(partition)
                partition = ''
                topic_timestamps.append(timestamps[start_idx])

        sent_idx += 1

    if len(partition) > 0:
        partitions.append(partition)
        topic_timestamps.append(timestamps[start_idx])

    return partitions, topic_timestamps
  

# import requests



# def query(payload):
# 	response = requests.post(API_URL, headers=headers, json=payload)
# 	return response.json()
	
# output = query({
# 	"inputs": {
# 		"source_sentence": "That is a happy person",
# 		"sentences": [
# 			"That is a happy dog",
# 			"That is a very happy person",
# 			"Today is a sunny day"
# 		]
# 	},
# })

# print(output)


if __name__ == '__main__':
    file_path = 'D:/dev/Cracke-AI/Data/videoplayback_demo.mp4'
    audio_path, size = convertToWav(file_path)
    chunks, timestamps = create_audio_chunks(audio_path)
    print(len(chunks))
    # print(chunks)
    print(timestamps)

    transcript = []
    for chunk in chunks:
        result = retry_query_asr(chunk)
        content = result[1]['text']
        transcript.append(content)

    print(transcript)

    topics, topic_timestamps = topic_segmentation(transcript, timestamps=timestamps)

    output = []
    idx = 0
    for topic in topics:
        title = retry_query_headline(topic)[1]['generated_text']
        output.append((topic_timestamps[idx], title, topic))
        idx += 1

    print(output)