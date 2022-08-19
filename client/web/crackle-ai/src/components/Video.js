import React, { useState } from "react";

function FileUpload() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isFileSelected, setIsFileSelected] = useState(false);

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
      const response = await fetch(serverURL, {
        method: "POST",
        body: formData,
      });
    }
    
  };

  return (
    <div>
      <input type="file" name="file" accept=".mp4" onChange={changeHandler} />

      {isFileSelected ? (
        <div>
          <p>Filename: {selectedFile.name}</p>

          <p>Filetype: {selectedFile.type}</p>

          <p>Size in bytes: {selectedFile.size}</p>

          <p>
            lastModifiedDate:{" "}
            {selectedFile.lastModifiedDate.toLocaleDateString()}
          </p>
        </div>
      ) : (
        <p>Select a file to show details</p>
      )}

      <div>
        <button onClick={handleSubmission}>Submit</button>
      </div>
    </div>
  );
}

export default FileUpload;
