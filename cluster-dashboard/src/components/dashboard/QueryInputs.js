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

    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
    };

    const formatDateForDisplay = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return `${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}-${date.getFullYear()}`;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        updateInputParams({ [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const formattedParams = {
            ...inputParams,
            start_date: formatDateForDisplay(inputParams.start_date),
            end_date: formatDateForDisplay(inputParams.end_date)
        };
        if (onExplicitQuery) {
            onExplicitQuery(formattedParams);
        }
        updateQueryParams(formattedParams);
        updateCurrentTimestep(formattedParams.start_date);
    };

    return (
        <form onSubmit={handleSubmit} style={{ ...neumorphicStyle, marginBottom: '9px' }}>
            <input
                type="date"
                name="start_date"
                value={formatDateForInput(inputParams.start_date)}
                onChange={handleInputChange}
                style={{ ...neumorphicStyleQueryInputs, marginRight: '19px' }}
            />
            <input
                type="date"
                name="end_date"
                value={formatDateForInput(inputParams.end_date)}
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
                    ...(isPressed ? pressedStyle : {}),
                    color: 'rgb(86,90,65)',
                    fontFamily: 'Courier'
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