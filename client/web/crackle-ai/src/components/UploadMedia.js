import React, { useState,useRef} from "react";
import axios from "axios";
import {useNavigate} from 'react-router-dom';
import './UploadMedia.css';

function FileUpload() {
  const [selectedFile, setSelectedFile] = useState(null); 
  const [isFileSelected, setIsFileSelected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);
  const [progress, setProgress] = useState('0%');

  const navigate= useNavigate(); 

  const inputRef = useRef(null);

  const serverURL = "http://localhost:5000/upload";

  const changeHandler = (event) => {
    setSelectedFile(event.target.files[0]);

    setIsFileSelected(true);
  };

  const handleSubmission = async () => {
    if(isFileSelected) {
      if (selectedFile.type && !selectedFile.type.startsWith("video/mp4")) {
        alert("Please select a video file having mp4 extension");
        return;
      }
      const formData = new FormData();
      formData.append("file", selectedFile);
      setIsLoading(true);
      let res = await axios.post(serverURL, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const { loaded, total } = progressEvent;
          setProgress(Math.round((loaded * 100) / total) + "%");
        }
      });
      console.log('tt');
      if(res.status===200){
        navigate('/result',{state:{
          filename : res.data.filename
        }})
      }
      
      setIsLoading(false);
      setIsUploaded(true);
    }
    
  };


  return (
    <div className="upload-container">
      <div className="upload-box" onClick={e => inputRef.current.click()}>
        <div className="upload-button">
          <button onClick={e => e.preventDefault()}>Drag or Browse .MP4 video here</button>
          <input type="file" ref={inputRef} name="file" accept=".mp4" onChange={changeHandler} style={{display: "none"}}/>
        </div>
        <div className="upload-icon">
          <span>UPLOAD ICON</span>
        </div>
        <div className="upload-status">
        {isFileSelected ? (
          <span style={{color: '#66FF75'}}>{selectedFile.name} | {Math.round(100*selectedFile.size/(1024*1024*8))/100} MB</span>
        ) : (
          <span>Select a file to show details</span>
        )}
        </div>

      </div>
      <div className="upload-submit">
        <button onClick={handleSubmission}>Upload & Create Index</button>
      </div>
      <div className="upload-percent">
      {isLoading && !isUploaded ? <p>Uploading...{progress}</p> : null}
      {isUploaded ? <p>Uploaded!</p> : null}
      </div>
    </div>
  );
}

export default FileUpload;
