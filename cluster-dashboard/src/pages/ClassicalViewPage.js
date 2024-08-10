import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { neumorphicStyle, neumorphicButtonStyle } from '../styles/globalStyles';
import QueryInputs from '../components/dashboard/QueryInputs';
import StandardAnalysesPanel from '../pages/StandardAnalysesPanel';
import { useQuery } from '../context/QueryContext';
import CurrentDateDisplay from '../components/common/CurrentDateDisplay';
import PlaybackControls from '../components/common/PlaybackControls';

const ClassicalViewPage = () => {
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedAnalysis, setSelectedAnalysis] = useState(null);
    const canvasRef = useRef(null);
    const { queryParams, updateQueryParams, currentTimestep, updateCurrentTimestep, isPlaying, togglePlayback } = useQuery();

    useEffect(() => {
        fetchData(queryParams);
    }, [queryParams]);

    useEffect(() => {
        if (data.length > 0 && canvasRef.current) {
            const currentIndex = data.findIndex(item => item.date === currentTimestep);
            if (currentIndex !== -1) {
                drawChart(currentIndex);
            } else if (data.length > 0) {
                updateCurrentTimestep(data[0].date);
            }
        }
    }, [currentTimestep, data, updateCurrentTimestep]);

    useEffect(() => {
        let interval;
        if (isPlaying && data.length > 0) {
            interval = setInterval(() => {
                updateCurrentTimestep(prevDate => {
                    const currentIndex = data.findIndex(item => item.date === prevDate);
                    const nextIndex = (currentIndex + 1) % data.length;
                    return data[nextIndex].date;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isPlaying, data, updateCurrentTimestep]);

    const fetchData = async (params) => {
        setIsLoading(true);
        try {
            const queryString = new URLSearchParams(params).toString();
            const response = await fetch(`http://127.0.0.1:5001/api/unified-data?${queryString}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const fetchedData = await response.json();
            const processedData = processDataForChart(fetchedData);
            setData(processedData);
            setIsLoading(false);
            if (processedData.length > 0 && !processedData.find(item => item.date === currentTimestep)) {
                updateCurrentTimestep(processedData[0].date);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            setError(error.message);
            setIsLoading(false);
        }
    };

    const processDataForChart = (rawData) => {
        const activityCounts = rawData.reduce((acc, item) => {
            const date = item.Date;
            if (!acc[date]) {
                const prevDate = acc[acc.length - 1];
                acc[date] = {
                    date,
                    JYG: { daily: 0, cumulative: prevDate ? prevDate.JYG.cumulative : 0 },
                    StudyCircle: { daily: 0, cumulative: prevDate ? prevDate.StudyCircle.cumulative : 0 },
                    ChildrensClass: { daily: 0, cumulative: prevDate ? prevDate.ChildrensClass.cumulative : 0 }
                };
            }
            const activityType = item.ActivityType === 'JYG' ? 'JYG' :
                item.ActivityType === 'Study Circle' ? 'StudyCircle' : 'ChildrensClass';
            acc[date][activityType].daily++;
            acc[date][activityType].cumulative++;
            return acc;
        }, {});
        return Object.values(activityCounts);
    };

    const drawChart = (currentIndex) => {
        if (!data.length || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const currentData = data[currentIndex];

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const barWidth = 100;
        const barSpacing = 50;
        const maxValue = Math.max(
            currentData.JYG.cumulative,
            currentData.StudyCircle.cumulative,
            currentData.ChildrensClass.cumulative
        );
        const scaleY = (canvas.height - 100) / maxValue;

        ctx.font = '14px Arial';
        ctx.fillStyle = 'black';

        // Draw Y-axis
        ctx.beginPath();
        ctx.moveTo(50, 20);
        ctx.lineTo(50, canvas.height - 30);
        ctx.stroke();

        // Draw X-axis
        ctx.beginPath();
        ctx.moveTo(50, canvas.height - 30);
        ctx.lineTo(canvas.width - 20, canvas.height - 30);
        ctx.stroke();

        const drawBar = (x, height, daily, cumulative, color, label) => {
            ctx.fillStyle = color;
            ctx.fillRect(x, canvas.height - 30 - height, barWidth, height);
            ctx.fillStyle = 'black';
            ctx.fillText(label, x + barWidth / 2 - ctx.measureText(label).width / 2, canvas.height - 10);
            ctx.fillText(cumulative, x + barWidth / 2 - ctx.measureText(cumulative.toString()).width / 2, canvas.height - 35 - height);
        };

        // JYG
        drawBar(70, currentData.JYG.cumulative * scaleY, currentData.JYG.daily, currentData.JYG.cumulative, 'rgba(109, 5, 245, 0.8)', 'JYG');

        // Study Circle
        drawBar(70 + barWidth + barSpacing, currentData.StudyCircle.cumulative * scaleY, currentData.StudyCircle.daily, currentData.StudyCircle.cumulative, 'rgba(130, 168, 2, 0.8)', 'Study Circle');

        // Children's Class
        drawBar(70 + (barWidth + barSpacing) * 2, currentData.ChildrensClass.cumulative * scaleY, currentData.ChildrensClass.daily, currentData.ChildrensClass.cumulative, 'rgba(242, 110, 2, 0.8)', "Children's Class");
    };

    const handleExplicitQuery = (newParams) => {
        updateQueryParams(newParams);
        fetchData(newParams);
    };

    const handleAnalysisChange = (analysis) => {
        setSelectedAnalysis(analysis);
    };

    if (isLoading) return <div style={neumorphicStyle}>Loading...</div>;
    if (error) return <div style={neumorphicStyle}>Error: {error}</div>;

    return (
        <div style={{padding: '20px', backgroundColor: '#faf7ed', minHeight: '100vh'}}>
            <div style={{marginBottom: '20px'}}>
                <button onClick={() => navigate('/')} style={neumorphicButtonStyle}>
                    Back to Overview
                </button>
            </div>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px'
            }}>
                <h2 style={{
                    color: '#333',
                    margin: '0',
                    marginTop: '5px',
                    marginBottom: '0',
                    fontSize: '1.8em',
                    flexShrink: 0
                }}>
                    Standard View
                </h2>
                <div style={{flex: 0.7, maxWidth: '990px', maxHeight:'190px', marginLeft: '0px', transform:'translateX(-390px)'}}>
                    <QueryInputs onExplicitQuery={handleExplicitQuery} />
                </div>
            </div>
            {data.length > 0 ? (
                <div style={{display: 'flex', gap: '20px', flexDirection: 'column'}}>
                    <div style={{display: 'flex', gap: '20px'}}>
                        <div style={{...neumorphicStyle, padding: '20px', flex: 2}}>
                            <canvas ref={canvasRef} width="600" height="350"></canvas>
                        </div>
                        <div style={{...neumorphicStyle, padding: '20px', flex: 1}}>
                            <StandardAnalysesPanel onAnalysisChange={handleAnalysisChange} data={data} />
                        </div>
                    </div>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        marginTop: '20px'
                    }}>
                        <CurrentDateDisplay currentDate={currentTimestep} />
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            width: '100%',
                            marginTop: '10px'
                        }}>
                            <PlaybackControls
                                data={data}
                                width="auto"
                                style={{
                                    border: `2px solid rgba(160, 82, 45, 0.1)`,
                                    padding: '10px',
                                }}
                            />
                        </div>
                    </div>
                </div>
            ) : (
                <div style={neumorphicStyle}>No data available</div>
            )}
        </div>
    );
};

export default ClassicalViewPage;