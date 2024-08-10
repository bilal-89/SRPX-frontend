import React, { useState } from 'react';
import {
    neumorphicControlsStyle2,
    neumorphicStyle,
    neumorphicStyleQueryInputs,
    pressedStyle
} from '../../styles/globalStyles';
import { useQuery } from '/Users/vincentparis/Documents/DEV/cluster-dashboard-frontend/cluster-dashboard/src/context/QueryContext.js';

const QueryInputs = ({ onExplicitQuery }) => {
    const { inputParams, updateInputParams, updateQueryParams, updateCurrentTimestep } = useQuery();
    const [isPressed, setIsPressed] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        updateInputParams({ [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (onExplicitQuery) {
            onExplicitQuery(inputParams);
        }
        updateQueryParams(inputParams);
        updateCurrentTimestep(inputParams.start_date);
    };

    return (
        <form onSubmit={handleSubmit} style={{ ...neumorphicStyle, marginBottom: '9px' }}>
            <input
                type="date"
                name="start_date"
                value={inputParams.start_date}
                onChange={handleInputChange}
                style={{ ...neumorphicStyleQueryInputs, marginRight: '19px' }}
            />
            <input
                type="date"
                name="end_date"
                value={inputParams.end_date}
                onChange={handleInputChange}
                style={{ ...neumorphicStyleQueryInputs, marginRight: '19px' }}
            />
            <input
                type="text"
                name="activity_type"
                value={inputParams.activity_type}
                onChange={handleInputChange}
                placeholder="Activity Type"
                style={{ ...neumorphicStyleQueryInputs, marginRight: '19px' }}
            />
            <input
                type="text"
                name="cluster"
                value={inputParams.cluster}
                onChange={handleInputChange}
                placeholder="Cluster"
                style={{ ...neumorphicStyleQueryInputs, marginRight: '19px' }}
            />
            <button
                type="submit"
                style={{
                    ...neumorphicControlsStyle2,
                    backgroundColor: 'rgb(240, 240, 216, 0.6)',
                    borderRadius: '12px',
                    ...(isPressed ? pressedStyle : {})
                }}
                onMouseDown={() => setIsPressed(true)}
                onMouseUp={() => setIsPressed(false)}
                onMouseLeave={() => setIsPressed(false)}
            >
                QUERY
            </button>
        </form>
    );
};

export default QueryInputs;