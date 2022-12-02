import React, { useEffect, useState } from 'react'
import socketIOClient from 'socket.io-client'
import { useLocation } from 'react-router-dom'
import Loader from './Loader';
import "./ResultScreen.css";
import Inference from './Inference';
import dummyData from "../demoData";

const serverURL = "http://localhost:5000/result";

export default function ResultScreen() {
  let page_state = useLocation();
  let file = page_state.state.filename;

  const stages = ['processing', 'chunking', 'asr', 'segmentation', 'naming', 'headline', 'done']

  const [result, setResult] = useState(null);

  const [stage, setStage] = useState('processing');
  //size of video
  const [totalLength, setTotalLength] = useState(0);
  //chunking
  const [chunks, setChunks] = useState(-1);
  //asr chunks done
  const [asrProgress, setAsrProgress] = useState(0);
  //segmentation
  const [topics, setTopics] = useState(-1);
  //naming progress
  const [namingProgress, setNamingProgress] = useState(0);
  //headline
  const [headline, setHeadline] = useState('Processing the video')
  //done
  const [done, setDone] = useState(false);


  useEffect(() => {
    const socket = socketIOClient(serverURL);
    socket.on('connect', () => {
      console.log(`Connected on ws`);

      socket.emit('infer', { data: { filename: file } });



    });
    socket.on('test', (data) => {
      console.log(data);
    });
    socket.on('processing', (data) => {
      setStage('processing');

      console.log(data);
    });

    socket.on('processing_done', (data) => {
      setStage('processing_done');
      setTotalLength(data.size);
      console.log(data);
    });

    socket.on('chunking_done', (data) => {
      setStage('chunking_done');
      setChunks(data.chunks);
      console.log(data);
    });

    socket.on('asr_status', (data) => {
      setStage('asr_status');
      setAsrProgress(data.current);
      console.log(data);
    });

    socket.on('asr_done', (data) => {
      setStage('asr_done');
      console.log(data);
    });

    socket.on('segmentation_done', (data) => {
      setStage('segmentation_done');
      setTopics(data.topics);
      console.log(data);
    });

    socket.on('naming_status', (data) => {
      setStage('naming_status')
      setNamingProgress(data.current);
      console.log(data);
    });

    socket.on('naming_done', (data) => {
      setStage('naming_done');
      console.log('naming done', data);
    });

    socket.on('headline_done', (data) => {
      setStage('headline_done');
      setHeadline(data.headline);
      console.log('headline done', data);
    });

    socket.on('done', (data) => {
      setStage('done');
      setDone(true);
      setResult(data.data);
      console.log('done', data);
      console.log(result);
    });

    return () => socket.disconnect();
  }, [])

  return (
    <>
      <div className='parent-bg'>{done ? (<Inference data={result} file={file} />) : (<div className='parent-loader'>

        {stage === 'processing' && <Loader load_state={{ stage: stage, count: 0, total: 0 }} />}
        {stage === 'processing_done' && <Loader load_state={{ stage: stage, count: 0, total: 0 }} />}
        {stage === 'chunking_done' && <Loader load_state={{ stage: stage, count: 0, total: chunks }} />}
        {stage === 'asr_status' && <Loader load_state={{ stage: stage, count: asrProgress, total: chunks }} />}
        {stage === 'asr_done' && <Loader load_state={{ stage: stage, count: 0, total: 0 }} />}
        {stage === 'segmentation_done' && <Loader load_state={{ stage: stage, count: 0, total: topics }} />}
        {stage === 'naming_status' && <Loader load_state={{ stage: stage, count: namingProgress, total: topics }} />}
        {stage === 'naming_done' && <Loader load_state={{ stage: stage, count: 0, total: 0 }} />}
        {done && console.log(result)}
      </div>)}
      </div>

    </>
  );
}
