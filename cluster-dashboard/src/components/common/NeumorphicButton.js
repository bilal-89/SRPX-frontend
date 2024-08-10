// src/components/common/NeumorphicButton.js
import React, { useState } from 'react';
import { neumorphicStyle, neumorphicButtonStyle } from '../../styles/globalStyles';

const NeumorphicButton = ({ onClick, children, style }) => {
    const [isPressed, setIsPressed] = useState(false);

    return (
        <button
            style={{
                ...neumorphicButtonStyle,
                ...(isPressed ? pressedStyle : {}),
                ...style
            }}
            onMouseDown={() => setIsPressed(true)}
            onMouseUp={() => setIsPressed(false)}
            onMouseLeave={() => setIsPressed(false)}
            onClick={onClick}
        >
            {children}
        </button>
    );
};

export default NeumorphicButton;