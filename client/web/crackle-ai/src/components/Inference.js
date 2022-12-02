import React from "react";
import "./Inference.css";
import Bulb from "./Bulb";

const Inference = ({ data, file }) => {

    const toTime = (msec) => {
        const sec = parseInt(msec) / 1000;
        const min = Math.floor(parseInt(sec) / 60);
        const second = parseInt(sec) % 60;
        return `${min}:${second}`;
    }

    const headline = data.headline;

    const topics = data.topics.map((elem, index) => elem.topic);

    const timeline = data.topics.map((elem, index) => toTime(elem.start));

    const content = data.topics.map((elem, index) => elem.content);

    timeline.splice(0, 0, "Start");
    timeline.push("End");


    return (
        <div className="main-infer">
            <div className="header-infer">
                <div id="text-infer">Video Uploaded: {file}</div>
                <div>
                    <span>
                        <Bulb />
                    </span>
                    <span id="title">
                        Suggested Title: {headline}
                    </span>
                </div>
                <div>
                    <span>
                        <Bulb />
                    </span>
                    <span id="title">
                        Topics Detected: {topics.map((elem, index) => <span className="topic-infer" key={index}>{elem}</span>)}
                    </span>
                </div>
            </div>
            <div className="body-infer">
                <div className="topics">
                    <div className="timeline">

                        {timeline.map((elem, index) => <div className="time" key={index}>{elem}</div>)}
                    </div>
                    <div className="items">
                        {topics.map((elem, index) => <div className="item" key={index}>{elem}</div>)}
                    </div>
                </div>
                <div className="topic-summary">

                </div>
            </div>

        </div>
    );
};

export default Inference;