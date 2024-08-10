import React from 'react';
import { neumorphicButtonStyle } from '../styles/globalStyles';

const backgroundColor = '#faf7ed';

const GeoAnalysesPanel = ({ onOverlayChange, selectedOverlay }) => {
    const overlays = [
        { name: 'Median Age', value: 'age' },
        { name: 'Population Density', value: 'density' },
        { name: 'Median Income', value: 'income' },
    ];

    const handleOverlayClick = (value) => {
        onOverlayChange(value === selectedOverlay ? null : value);
    };

    return (
        <div>
            <h3>Geographic Analyses</h3>
            {overlays.map(overlay => (
                <button
                    key={overlay.value}
                    onClick={() => handleOverlayClick(overlay.value)}
                    style={{
                        ...neumorphicButtonStyle,
                        margin: '5px',
                        backgroundColor: selectedOverlay === overlay.value ? '#e0e0e0' : backgroundColor,
                    }}
                >
                    {overlay.name}
                </button>
            ))}
            {selectedOverlay && (
                <p>Selected Overlay: {overlays.find(o => o.value === selectedOverlay)?.name}</p>
            )}
        </div>
    );
};

export default GeoAnalysesPanel;