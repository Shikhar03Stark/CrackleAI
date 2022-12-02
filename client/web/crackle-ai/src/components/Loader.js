import React, { useCallback, useEffect, useState } from 'react';
import PacmanLoader from "react-spinners/PacmanLoader";
import "./ResultScreen.css";
const Loader = ({ load_state }) => {
    const stage = load_state.stage;
    const count = load_state.count;
    const total = load_state.total;

    const override = `
    display: block;
    margin: 0 auto;
    border-color: red;`;

    const [loader_title, setLoaderTitle] = useState('');

    const setTitle = useCallback(() => {
        if (stage === 'processing') {
            setLoaderTitle('Setting up environment for processing video');
        }
        else if (stage === 'processing_done') {
            setLoaderTitle('Chunking video file into smaller segments');

        }
        else if (stage === 'chunking_done') {
            setLoaderTitle(`Generating transcripts for all chunks (${total} items)`);
        }
        else if (stage === 'asr_status') {
            setLoaderTitle(`Transcript generation in progress `);
        }
        else if (stage === 'asr_done') {
            setLoaderTitle('Deriving topics from transcript');

        }
        else if (stage === 'segmentation_done') {
            setLoaderTitle(`Total topics derived ${total}`);
        }
        else if (stage === 'naming_status') {
            setLoaderTitle(`Naming topics in progress `);
        }
        else if (stage === 'naming_done') {
            setLoaderTitle(`Generating title for entire video`);
        }
        else if (stage === 'done') {
            setLoaderTitle(`Video processing successfull`);
        }
    }, [])

    useEffect(() => setTitle(), [count]);

    let title = stage === 'asr_status' || stage === 'naming_status' ? loader_title + `${Math.floor((100 * count) / total)}%` : loader_title;
    return (
        <div className='loader'>
            <span className='title'>{title}</span>
            <PacmanLoader color={'#226AF6'} isLoading={true} css={override} size={40} />
        </div>
    );
}

export default Loader;