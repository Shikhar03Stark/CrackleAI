import React from 'react';
import './NameStrip.css';

const NameStrip = ({username, setUsername}) => {
    return (
        <div className="name-background">
            <span className="name-greet">Hi, <u>{username}</u></span>
        </div>
    );
}

export default NameStrip;