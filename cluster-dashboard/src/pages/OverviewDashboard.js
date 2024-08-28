import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import MapView from '../components/dashboard/MapView';
import NetworkView from '../components/dashboard/NetworkView';
import SimplifiedOlogView from '../components/dashboard/SimplifiedOlogView';
import SimplifiedClassicalView from '../components/dashboard/SimplifiedClassicalView';
import QueryInputs from '../components/dashboard/QueryInputs';
import ViewButton from '../components/common/ViewButton';
import CurrentDateDisplay from '../components/common/CurrentDateDisplay';
import PlaybackControls from '../components/common/PlaybackControls';
import useFetchData from '../hooks/useFetchData';
import {
    neumorphicStyle,
    neumorphicButtonStyle,
    neumorphicStyleQueryInputs,
    neumorphicControlsStyle,
    neumorphicControlsStyle3
} from '../styles/globalStyles';
import { useQuery } from '../context/QueryContext';

const activityMapping = {
    'Study Circle': { color: 'rgb(130, 168, 2, 0.6)', label: 'SC' },
    'Devotional': { color: 'rgb(184, 2, 75, 0.6)', label: 'DEV' },
    'Home Visit': { color: 'rgb(245, 45, 5, 0.6)', label: 'HV' },
    "Children's Class": { color: 'rgb(270, 110, 2, 0.6)', label: 'CC' },
    'JYG': { color: 'rgb(195, 122, 255, 0.5)', label: 'JYG' },
    'Nucleus': { color: 'rgba(152,54,18,0.9)', label: 'NUC' }
};

const OverviewDashboard = () => {
    const navigate = useNavigate();
    const [pressedButton, setPressedButton] = useState('');
    const networkRef = useRef(null);
    const { queryParams, updateQueryParams, currentTimestep, updateCurrentTimestep, isPlaying, togglePlayback, hasInitialQuery } = useQuery();

    const { data, error, refetch } = useFetchData('http://localhost:5001/api/unified-data', queryParams);

    const groupedData = useMemo(() => {
        if (!data) return [];
        const grouped = {};
        data.forEach(item => {
            if (!grouped[item.Date]) {
                grouped[item.Date] = [];
            }
            grouped[item.Date].push(item);
        });
        return Object.entries(grouped).map(([date, activities]) => ({ date, activities }));
    }, [data]);

    const currentDataIndex = useMemo(() => {
        return groupedData.findIndex(item => item.date === currentTimestep);
    }, [groupedData, currentTimestep]);

    const currentData = useMemo(() => {
        if (!groupedData.length) return [];
        return groupedData[currentDataIndex]?.activities || [];
    }, [groupedData, currentDataIndex]);

    const handleElementClick = (element) => {
        console.log('Clicked element:', element);
        // You can add more logic here to handle the click event
    };

    useEffect(() => {
        if (groupedData.length > 0 && currentDataIndex === -1) {
            updateCurrentTimestep(groupedData[0].date);
        }
    }, [groupedData, currentDataIndex, updateCurrentTimestep]);

    useEffect(() => {
        let intervalId;
        if (isPlaying) {
            intervalId = setInterval(() => {
                const currentIndex = groupedData.findIndex(item => item.date === currentTimestep);
                const nextIndex = (currentIndex + 1) % groupedData.length;
                updateCurrentTimestep(groupedData[nextIndex].date);
            }, 1440); // Change this value to adjust the playback speed
        }
        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [isPlaying, currentTimestep, groupedData, updateCurrentTimestep]);

    const handleExplicitQuery = (newParams) => {
        updateQueryParams(newParams);
        refetch(newParams);
    };

    if (error) return <div style={neumorphicStyle}>Error: {error}</div>;

    const currentDate = groupedData[currentDataIndex]?.date;

    return (
        <div style={{padding: '10px 20px 20px', backgroundColor: '#faf7ed', minHeight: '100vh', fontFamily:'Kiwi Maru'}}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px'
            }}>
                <h1 style={{
                    marginTop: '5px',
                    marginBottom: '0px',
                    color: 'rgb(112,113,95)',
                    fontSize: '1.8em',
                    flexShrink: 0,
                    marginLeft: '19px',
                    fontFamily:'Averia Serif Libre'
                }}>
                    Analytics Dashboard
                </h1>
                <div style={{
                    flex: .7, maxWidth: '990px', maxHeight: '190px', marginLeft: '0px',
                    transform: 'translateX(-390px)'
                }}>
                    <QueryInputs onExplicitQuery={handleExplicitQuery}/>
                </div>
            </div>
            <div style={{
                fontFamily: 'Averia Serif',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '20px',
                marginBottom: '20px'
            }}>
                <ViewButton style={{...neumorphicControlsStyle3, height: '300px'}}
                            title="Geographic View"
                            path="/geo"
                            pressedButton={pressedButton}
                            setPressedButton={setPressedButton}
                            navigate={navigate}
                >
                    <div style={{height: '260px'}}>
                        {hasInitialQuery ? (
                            <MapView
                                groupedData={groupedData}
                                currentDataIndex={currentDataIndex}
                            />
                        ) : (
                            <div>Please make a query</div>
                        )}
                    </div>
                </ViewButton>
                <ViewButton style={{...neumorphicControlsStyle3, height: '300px'}}
                            title="Network View"
                            path="/net"
                            pressedButton={pressedButton}
                            setPressedButton={setPressedButton}
                            navigate={navigate}
                >
                    <div style={{height: '260px'}}>
                        {hasInitialQuery ? (
                            <NetworkView
                                networkRef={networkRef}
                                data={currentData}
                                onElementClick={handleElementClick}
                                activityMapping={activityMapping}
                            />
                        ) : (
                            <div>Please make a query</div>
                        )}
                    </div>
                </ViewButton>
                <ViewButton style={{...neumorphicControlsStyle3, height: '300px'}}
                            title="Programmatic View"
                            path="/structural"
                            pressedButton={pressedButton}
                            setPressedButton={setPressedButton}
                            navigate={navigate}
                >
                    <div style={{height: '260px'}}>
                        {hasInitialQuery ? (
                            <SimplifiedOlogView groupedData={groupedData} currentDataIndex={currentDataIndex}/>
                        ) : (
                            <div>Please make a query</div>
                        )}
                    </div>
                </ViewButton>
                <ViewButton style={{...neumorphicControlsStyle3, height: '300px'}}
                            title="Standard View"
                            path="/classical"
                            pressedButton={pressedButton}
                            setPressedButton={setPressedButton}
                            navigate={navigate}
                >
                    <div style={{height: '260px'}}>
                        {hasInitialQuery ? (
                            <SimplifiedClassicalView data={currentData}/>
                        ) : (
                            <div>Please make a query</div>
                        )}
                    </div>
                </ViewButton>
            </div>
            {hasInitialQuery && <CurrentDateDisplay currentDate={currentDate}/>}
            {hasInitialQuery && (
                <div style={{display: 'flex', justifyContent: 'center', marginTop: '20px'}}>
                    <PlaybackControls
                        data={groupedData}
                        width="auto"
                    />
                </div>
            )}
        </div>
    );
};

export default OverviewDashboard;