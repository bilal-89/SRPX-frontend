import React from 'react';
import { neumorphicStyle, headerButtonStyle, pressedStyle } from '../../styles/globalStyles';

const ViewButton = ({ title, path, pressedButton, setPressedButton, navigate, children }) => {
    const handleMouseDown = () => setPressedButton(path);
    const handleMouseUp = () => setPressedButton('');
    const handleNavigation = () => navigate(path);

    return (
        <div style={{
            ...neumorphicStyle,
            height: '300px',
            display: 'flex',
            flexDirection: 'column',
            ...(pressedButton === path ? pressedStyle : {})
        }}>
            <button
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onClick={handleNavigation}
                style={{
                    ...headerButtonStyle,
                    ...(pressedButton === path ? pressedStyle : {})
                }}
            >
                {title}
            </button>
            <div style={{flex: 1, borderRadius: '10px', overflow: 'hidden'}}>
                {children}
            </div>
        </div>
    );
};

export default ViewButton;