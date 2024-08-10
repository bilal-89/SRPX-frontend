// src/context/QueryContext.js

import React, { createContext, useState, useContext, useCallback } from 'react';

const QueryContext = createContext();

export const QueryProvider = ({ children }) => {
    const [queryParams, setQueryParams] = useState({
        start_date: '2023-07-01',
        end_date: '2023-07-31',
        activity_type: '',
        cluster: 'Philadelphia Cluster'
    });

    const [inputParams, setInputParams] = useState(queryParams);
    const [currentTimestep, setCurrentTimestep] = useState(queryParams.start_date);
    const [isPlaying, setIsPlaying] = useState(false);

    const updateQueryParams = useCallback((newParams) => {
        setQueryParams(prevParams => ({ ...prevParams, ...newParams }));
        // Reset currentTimestep when query changes
        setCurrentTimestep(newParams.start_date || prevParams.start_date);
    }, []);

    const updateInputParams = useCallback((newParams) => {
        setInputParams(prevParams => ({ ...prevParams, ...newParams }));
    }, []);

    const updateCurrentTimestep = useCallback((newTimestep) => {
        setCurrentTimestep(newTimestep);
    }, []);

    const togglePlayback = useCallback(() => {
        setIsPlaying(prev => !prev);
    }, []);

    return (
        <QueryContext.Provider value={{
            queryParams,
            updateQueryParams,
            inputParams,
            updateInputParams,
            currentTimestep,
            updateCurrentTimestep,
            isPlaying,
            togglePlayback
        }}>
            {children}
        </QueryContext.Provider>
    );
};

export const useQuery = () => useContext(QueryContext);