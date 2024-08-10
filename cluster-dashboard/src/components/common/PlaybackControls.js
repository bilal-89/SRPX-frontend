// src/components/PlaybackControls.js

import React, { useState } from 'react';
import { FaFastBackward, FaBackward, FaPlay, FaPause, FaForward, FaFastForward } from 'react-icons/fa';
import { useQuery } from '../../context/QueryContext';
import { neumorphicButtonStyle, neumorphicControlsStyle } from '../../styles/globalStyles';

const PlaybackControls = ({ data, width = '32%', style = {} }) => {
    const { currentTimestep, updateCurrentTimestep, isPlaying, togglePlayback } = useQuery();
    const [pressedButton, setPressedButton] = useState(null);

    const handleBeginning = () => {
        updateCurrentTimestep(data[0].date);
    };

    const handlePrevious = () => {
        const currentIndex = data.findIndex(item => item.date === currentTimestep);
        const prevIndex = (currentIndex - 1 + data.length) % data.length;
        updateCurrentTimestep(data[prevIndex].date);
    };

    const handleNext = () => {
        const currentIndex = data.findIndex(item => item.date === currentTimestep);
        const nextIndex = (currentIndex + 1) % data.length;
        updateCurrentTimestep(data[nextIndex].date);
    };

    const handleEnd = () => {
        updateCurrentTimestep(data[data.length - 1].date);
    };

    const handleMouseDown = (button) => {
        setPressedButton(button);
    };

    const handleMouseUp = () => {
        setPressedButton(null);
    };

    return (

        <div style={{
            ...neumorphicControlsStyle,
            width,
            display: 'flex',
            justifyContent: 'center',
            ...style
        }}>
            {['beginning', 'previous', 'playPause', 'next', 'end'].map((control) => (
                <button
                    key={control}
                    onMouseDown={() => handleMouseDown(control)}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onClick={() => {
                        switch (control) {
                            case 'beginning':
                                handleBeginning();
                                break;
                            case 'previous':
                                handlePrevious();
                                break;
                            case 'playPause':
                                togglePlayback();
                                break;
                            case 'next':
                                handleNext();
                                break;
                            case 'end':
                                handleEnd();
                                break;
                        }
                    }}
                    style={{
                        ...neumorphicButtonStyle,
                        boxShadow: pressedButton === control
                            ? 'inset 2px 2px 2px #d1d1b7, inset -2px -2px 2px #fffff9'
                            : '2px 2px 2px #d1d1b7, -2px -2px 2px #fffff9',
                        transition: 'all 0s ease'
                    }}
                >
                    {control === 'beginning' && <FaFastBackward/>}
                    {control === 'previous' && <FaBackward/>}
                    {control === 'playPause' && (isPlaying ? <FaPause/> : <FaPlay/>)}
                    {control === 'next' && <FaForward/>}
                    {control === 'end' && <FaFastForward/>}
                </button>
            ))}
        </div>
    );
};

export default PlaybackControls;