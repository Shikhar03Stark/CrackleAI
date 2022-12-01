import React, {useEffect, useState} from 'react'
import socketIOClient from 'socket.io-client'
import { useLocation } from 'react-router-dom'
import axios from 'axios';

const serverURL = "http://localhost:5000/result";

export default function ResultScreen() {
  let page_state = useLocation();
  let file = page_state.state.filename;

  const stages = ['processing', 'chunking', 'asr', 'segmentation', 'naming', 'headline', 'done']

  const [display, setDisplay] = useState('');

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

      socket.emit('infer', {data: {filename: file}});

      
      
    });
    socket.on('test', (data) => {
      console.log(data);
    });
    socket.on('processing', (data) => {
      setStage('processing');
      setDisplay(data.message);
      console.log(data);
    });

    socket.on('processing_done', (data) => {
      setStage('chunking');
      setTotalLength(data.size);
      setDisplay(data.message);
      console.log(data);
    });

    socket.on('chunking_done', (data) => {
      setStage('asr');
      setChunks(data.chunks);
      setDisplay(data.message);
      console.log(data);
    });

    socket.on('asr_status', (data) => {
      setAsrProgress(data.current);
      console.log(data);
    });

    socket.on('asr_done', (data) => {
      setStage('segmentation');
      setDisplay(data.message);
      console.log(data);
    });

    socket.on('segmentation_done', (data) => {
      setStage('naming');
      setTopics(data.topics);
      setDisplay(data.message);
      console.log(data);
    });

    socket.on('naming_status', (data) => {
      setNamingProgress(data.current);
      console.log(data);
    });

    socket.on('naming_done', (data) => {
      setStage('headline');
      setDisplay(data.message);
      console.log(data);
    });
    
    socket.on('headline_done', (data) => {
      setStage('done');
      setHeadline(data.headline);
      setDisplay(data.message);
      console.log(data);
    });

    socket.on('done', (data) => {
      setStage('done');
      setDone(true);
      setDisplay(data.message);
      setResult(data.data);
      console.log(data);
    });

    return () => socket.disconnect();
  }, [])

  return (
    <>
      <h1>{done ? (display) : ('Loading...')}</h1>
      <div>
        <h2>Stage: {stage}</h2>
        {stage === 'processing' && <p>{display}</p>}
        {stage === 'chunking' && <p>{display} {chunks} chunks</p>}
        {stage === 'asr' && <p>{display} {asrProgress}/{chunks} chunks done</p>}
        {stage === 'segmentation' && <p>{display} {topics} topics</p>}
        {stage === 'naming' && <p>{display} {namingProgress}/{topics} topics done</p>}
        {stage === 'headline' && <p>{display} {headline}</p>}
        {stage === 'done' && <p>{display}</p>}
        {done && console.log(result)}
      </div>
    </>
  );
}
