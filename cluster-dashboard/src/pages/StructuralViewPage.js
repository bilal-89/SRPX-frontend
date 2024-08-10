import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { neumorphicStyle, neumorphicButtonStyle, neumorphicControlsStyle } from '../styles/globalStyles';
import AnimatedOlogVisualization from '../components/dashboard/AnimatedOlogVisualization';
import QueryInputs from '../components/dashboard/QueryInputs';
import { useQuery } from '../context/QueryContext';

const StructuralViewPage = () => {
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const { queryParams, updateQueryParams, currentTimestep, updateCurrentTimestep } = useQuery();

    const fetchData = useCallback(async (params) => {
        setIsLoading(true);
        try {
            const queryString = new URLSearchParams(params).toString();
            const response = await fetch(`http://127.0.0.1:5001/api/unified-data?${queryString}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const fetchedData = await response.json();
            setData(fetchedData);
            setIsLoading(false);
        } catch (error) {
            console.error("Error fetching data:", error);
            setError(error.message);
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData(queryParams);
    }, [fetchData, queryParams]);

    const groupedData = useMemo(() => {
        const grouped = {};
        data.forEach(item => {
            if (!grouped[item.Date]) {
                grouped[item.Date] = [];
            }
            grouped[item.Date].push(item);
        });
        return Object.entries(grouped).map(([date, activities]) => ({ date, activities }));
    }, [data]);

    useEffect(() => {
        if (groupedData.length > 0 && !groupedData.find(item => item.date === currentTimestep)) {
            updateCurrentTimestep(groupedData[0].date);
        }
    }, [groupedData, currentTimestep, updateCurrentTimestep]);

    const handleExplicitQuery = useCallback((newParams) => {
        updateQueryParams(newParams);
        fetchData(newParams);
    }, [updateQueryParams, fetchData]);

    const navigateToOverview = () => navigate('/');

    if (isLoading) return <div style={neumorphicStyle}>Loading...</div>;
    if (error) return <div style={neumorphicStyle}>Error: {error}</div>;

    return (
        <div style={{padding: '20px', backgroundColor: '#faf7ed', minHeight: '120vh'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                <button onClick={navigateToOverview} style={neumorphicButtonStyle}>
                    Back to Overview
                </button>
                <h2 style={{color: '#333', margin: '0'}}>Programmatic View</h2>
                <div style={{width: '150px'}}></div>
            </div>
            <QueryInputs onExplicitQuery={handleExplicitQuery} />
            <div style={{...neumorphicStyle, padding: '20px', marginTop: '20px', display: 'flex'}}>
                <div style={{flex: 2, marginRight: '20px'}}>
                    <AnimatedOlogVisualization
                        data={data}
                        navigateToOverview={navigateToOverview}
                        currentTimestep={currentTimestep}
                        updateCurrentTimestep={updateCurrentTimestep}
                        groupedData={groupedData}
                    />
                </div>
                <div style={{...neumorphicControlsStyle, flex: 1, maxWidth:'360px', padding: '20px', maxHeight: '540px', overflowY: 'auto',border:'2px solid rgb(160, 82, 45, .1)'}}>
                    <h3 style={{color: '#5a5a4f',textAlign:'right', marginTop: '0'}}>Analyses Panel</h3>
                    {/* Add your analyses panel content here */}
                </div>
            </div>
        </div>
    );
};

export default StructuralViewPage;