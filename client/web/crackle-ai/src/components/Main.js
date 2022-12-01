import React, {useState } from "react";
import NameStrip from "./NameStrip";
import FileUpload from "./UploadMedia";
import './Main.css';

function Main(){
    const [username, setUsername] = useState('Guest');
    return (
        <div className="main-background">
            <NameStrip username={username} />
            <FileUpload />
        </div>
    );
}

export default Main;