import React from 'react';
import { useNavigate } from 'react-router-dom';
import { neumorphicStyle, neumorphicButtonStyle } from '../../styles/globalStyles';

const Layout = ({ children, title }) => {
    const navigate = useNavigate();

    return (
        <div style={{padding: '20px', backgroundColor: '#faf7ed', minHeight: '100vh'}}>
            <button onClick={() => navigate('/')} style={neumorphicButtonStyle}>
                Back to Overview
            </button>
            <h2 style={{marginBottom: '20px', color: '#333'}}>{title}</h2>
            <div style={neumorphicStyle}>
                {children}
            </div>
        </div>
    );
};

export default Layout;