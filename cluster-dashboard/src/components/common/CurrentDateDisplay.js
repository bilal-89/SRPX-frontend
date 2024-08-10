// src/components/common/CurrentDateDisplay.js
import React from 'react';
import { useQuery } from '../../context/QueryContext';

const CurrentDateDisplay = () => {
    const { currentTimestep } = useQuery();

    return (
        <div style={{
            fontSize: '1em',
            fontWeight: 'bold',
            color: '#5a5a4f',
            textAlign: 'center',
            padding: '5px',
            marginTop: '10px'
        }}>
            {currentTimestep || 'N/A'}
        </div>
    );
};

export default CurrentDateDisplay;