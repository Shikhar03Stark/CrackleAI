import React, { useEffect, useState } from "react";
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

    const summary = data.topics.map((elem, index) => elem.summary);

    const [index, setIndex] = useState(1);

    const mapTimelineToTopic = (timeline, topic) => {
        let n = timeline.length;
        let mergedList = [];
        let k = 0;
        for (let i = 0; i < n; i++) {
            if (i === 0 || i === n - 1) {
                mergedList.push({ timeline: timeline[i], topic: "" });
            }
            else {
                mergedList.push({ timeline: timeline[i], topic: topic[k] });
                k++;
            }
        }
        return mergedList;
    }

    const toggleState = (idx) => {
        setIndex(idx);
    }



    timeline.splice(0, 0, "Start");
    timeline.push("End");
    let mergedList = mapTimelineToTopic(timeline, topics);

    return (
        <div className="main-infer">
            <div className="header-infer">
                <div id="text-infer">
                    <p>
                        Video Uploaded: {file}
                    </p>
                </div>
                <div>
                    <p>
                        <span>
                            <Bulb />
                        </span>
                        <span className="title">
                            Suggested Title: <span id="headline-content"><u>{headline}</u></span>
                        </span>

                    </p>
                </div>
                <div>
                    <p>
                        <span>
                            <Bulb />
                        </span>
                        <span className="title">
                            Topics Detected: {topics.length}
                            <div className="topic-gutter">
                                <span>{topics.map((elem, index) => <span className="topic-infer" key={index}><b>{elem}</b></span>)}</span>
                            </div>
                        </span>
                    </p>
                </div>
            </div>
            <div className="body-infer">

                <table className="timeline">
                    {mergedList.map((elem, idx) => {
                        return (
                            <tr>
                                <td>{elem.timeline}</td>
                                {idx === 0 || idx === mergedList.length - 1 ? <td>{elem.topic}</td> : <td className="topic-infer">{elem.topic}</td>}
                                {idx === 0 || idx === mergedList.length - 1 ? <td></td> : <td className="topic-action" onClick={() => toggleState(idx - 1)}>{index == idx - 1 ? <b>-</b> : <b>+</b>}</td>}
                            </tr>
                        );
                    })}
                </table>

                <div className="topic-summary">
                    <div className="topic-summary-title">
                        {topics[index]}
                    </div>
                    <div className="topic-summary-body">
                        {summary[index]}
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Inference;