// src/components/NetPage.js

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import NetworkView from '../components/dashboard/NetworkView';
import QueryInputs from '../components/dashboard/QueryInputs';
import AnalysesPanel from './AnalysesPanel';
import PlaybackControls from '../components/common/PlaybackControls';
import { neumorphicStyle, neumorphicButtonStyle, neumorphicControlsStyle } from '../styles/globalStyles';
import { useQuery } from '../context/QueryContext';
import CurrentDateDisplay from '../components/common/CurrentDateDisplay'; // Import the CurrentDateDisplay component


const MemoizedNetworkView = React.memo(NetworkView);

const activityMapping = {
    'Study Circle': { color: 'rgb(130, 168, 2, 0.6)', label: 'SC' },
    'Devotional': { color: 'rgb(184, 2, 75, 0.6)', label: 'DEV' },
    'Home Visit': { color: 'rgb(245, 45, 5, 0.6)', label: 'HV' },
    "Children's Class": { color: 'rgb(270, 110, 2, 0.6)', label: 'CC' },
    'JYG': { color: 'rgb(195, 122, 255, 0.5)', label: 'JYG' },
    'Nucleus':{ color: 'rgba(152,54,18,0.9)', label: 'NUC' }
};

const NetPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const networkRef = useRef(null);
    const [data, setData] = useState([]);
    const [selectedElement, setSelectedElement] = useState(null);
    const [centralityMeasures, setCentralityMeasures] = useState(null);
    const [participantMap, setParticipantMap] = useState({});
    const [viewMode, setViewMode] = useState('SET');
    const [isLayeredView, setIsLayeredView] = useState(false);
    const { queryParams, updateQueryParams, currentTimestep, updateCurrentTimestep, isPlaying, togglePlayback } = useQuery();

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

    const currentDataIndex = useMemo(() => {
        return groupedData.findIndex(item => item.date === currentTimestep);
    }, [groupedData, currentTimestep]);

    const currentData = useMemo(() => {
        return groupedData[currentDataIndex]?.activities || [];
    }, [groupedData, currentDataIndex]);

    useEffect(() => {
        fetchData(queryParams);
    }, [queryParams]);

    useEffect(() => {
        let interval;
        if (isPlaying && groupedData.length > 0) {
            interval = setInterval(() => {
                updateCurrentTimestep(prevDate => {
                    const currentIndex = groupedData.findIndex(item => item.date === prevDate);
                    const nextIndex = (currentIndex + 1) % groupedData.length;
                    return groupedData[nextIndex].date;
                });
            }, 1440); // Change this value to adjust the playback speed
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isPlaying, groupedData, updateCurrentTimestep]);

    const fetchData = async (params) => {
        setLoading(true);
        try {
            const queryString = new URLSearchParams(params).toString();
            const [networkResponse, centralityResponse] = await Promise.all([
                fetch(`http://localhost:5001/api/unified-data?${queryString}`),
                fetch('http://localhost:5001/api/centrality-measures')
            ]);

            if (!networkResponse.ok || !centralityResponse.ok) {
                throw new Error(`HTTP error! status: ${networkResponse.status}, ${centralityResponse.status}`);
            }

            const networkData = await networkResponse.json();
            const centralityData = await centralityResponse.json();

            setData(networkData);
            setCentralityMeasures(centralityData.centrality);

            // Create participant mapping
            const mapping = {};
            networkData.forEach(item => {
                const participantIDs = item.ParticipantIDs.split(',');
                const participantNames = item.ParticipantNames.split(',');
                const participantRoles = item.ParticipantRoles.split(',');
                participantIDs.forEach((id, index) => {
                    if (!mapping[id]) {
                        mapping[id] = {
                            name: participantNames[index],
                            roles: {}
                        };
                    }
                    mapping[id].roles[item.Date] = participantRoles[index];
                });
            });
            setParticipantMap(mapping);

            setLoading(false);

            // Set the current timestep to the first date if it's not already set
            if (groupedData.length > 0 && !groupedData.find(item => item.date === currentTimestep)) {
                updateCurrentTimestep(groupedData[0].date);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            setError(error.message);
            setLoading(false);
        }
    };

    const handleExplicitQuery = useCallback((newParams) => {
        updateQueryParams(newParams);
        fetchData(newParams);
    }, [updateQueryParams]);

    const handleElementClick = useCallback((element) => {
        if (element && element.data) {
            setSelectedElement(element);
        } else {
            setSelectedElement(null);
        }
    }, []);

    const getCumulativeData = useCallback(() => {
        console.log("Getting cumulative data");  // Debug log
        const cumulativeData = [];
        let participants = new Map();
        let connections = new Map();
        let accompaniers = new Set();
        let independentFacilitators = new Set();
        let regularParticipants = new Set();

        groupedData.slice(0, currentDataIndex + 1).forEach(({ activities }) => {
            activities.forEach(activity => {
                const participantIDs = activity.ParticipantIDs.split(',');
                const participantRoles = activity.ParticipantRoles.split(',');
                const activityType = activity.ActivityType;

                participantIDs.forEach((id, index) => {
                    if (!participants.has(id)) {
                        participants.set(id, {});
                    }
                    if (!participants.get(id)[activityType]) {
                        participants.get(id)[activityType] = 0;
                    }
                    participants.get(id)[activityType]++;

                    // ... (role assignment logic remains unchanged)
                });

                for (let i = 0; i < participantIDs.length; i++) {
                    for (let j = i + 1; j < participantIDs.length; j++) {
                        const connectionKey = [participantIDs[i], participantIDs[j]].sort().join('-');
                        if (!connections.has(connectionKey)) {
                            connections.set(connectionKey, {});
                        }
                        if (!connections.get(connectionKey)[activityType]) {
                            connections.get(connectionKey)[activityType] = 0;
                        }
                        connections.get(connectionKey)[activityType]++;
                    }
                }
            });
        });

        const latestActivity = currentData[currentData.length - 1] || {};
        cumulativeData.push({
            ...latestActivity,
            ParticipantIDs: Array.from(participants.keys()).join(','),
            ParticipantActivities: Object.fromEntries(participants),
            Connections: Array.from(connections.entries()).map(([key, activities]) => ({ key, activities })),
            Accompaniers: Array.from(accompaniers),
            IndependentFacilitators: Array.from(independentFacilitators),
            RegularParticipants: Array.from(regularParticipants)
        });

        console.log("Cumulative data:", cumulativeData);  // Debug log
        return cumulativeData;
    }, [groupedData, currentDataIndex, currentData]);

    const renderSelectedElementInfo = () => {
        if (!selectedElement) {
            return <p>No element selected. Click on a node or edge to see its information.</p>;
        }

        if (!selectedElement.data) {
            return <p>Selected element has no data. Element type: {selectedElement.type}</p>;
        }

        if (selectedElement.type === 'node') {
            const { id } = selectedElement.data;
            const participantInfo = participantMap[id] || {};
            const currentRole = participantInfo.roles?.[currentTimestep] || 'Unknown';
            return (
                <>
                    <h3 style={{marginBottom:'9px'}}>Participant Information</h3>
                    <p style={{marginTop:'19px', fontFamily:'Courier'}}>{participantInfo.name || 'Unknown'}</p>
                    <p style={{fontFamily:'Courier'}}>{currentRole}</p>
                    <p style={{fontFamily:'Courier'}}>ID: {id || 'N/A'}</p>
                </>
            );
        } else if (selectedElement.type === 'edge') {
            const { from, to } = selectedElement.data;
            const fromRole = participantMap[from]?.roles?.[currentTimestep] || 'Unknown';
            const toRole = participantMap[to]?.roles?.[currentTimestep] || 'Unknown';
            return (
                <>
                    <h3>Connection Information</h3>
                    <p>From: {participantMap[from]?.name || 'Unknown'} (Role: {fromRole})</p>
                    <p>To: {participantMap[to]?.name || 'Unknown'} (Role: {toRole})</p>
                </>
            );
        }

        return <p>Unknown element type: {selectedElement.type}</p>;
    };

    if (loading) return <div style={neumorphicStyle}>Loading...</div>;
    if (error) return <div style={neumorphicStyle}>Error: {error}</div>;
    return (
        <div style={{padding: '20px', backgroundColor: '#faf7ed', minHeight: '120vh'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                <button onClick={() => navigate('/')} style={neumorphicButtonStyle}>
                    Back to Overview
                </button>
                <h2 style={{color: '#333', margin: '0',
                    // fontFamily:'Kiwi Maru',
                    // fontFamily:'Maname'
                    fontFamily:'Averia Serif Libre'
                }}>Network View</h2>
                <div style={{width: '150px'}}></div>
            </div>
            <QueryInputs
                onExplicitQuery={handleExplicitQuery}
                initialQueryParams={queryParams}
            />
            <div style={{...neumorphicStyle, padding: '20px', marginTop: '20px'}}>
                <div style={{display: 'flex', height: '60vh', marginBottom: '20px'}}>
                    <div style={{width: '250px', padding: '10px', overflowY: 'auto'}}>
                        {renderSelectedElementInfo()}
                    </div>
                    <div style={{flex: 1}}>
                        <MemoizedNetworkView
                            networkRef={networkRef}
                            data={viewMode === 'SUM' ? getCumulativeData() : currentData}
                            onElementClick={handleElementClick}
                            currentDate={currentTimestep}
                            participantMap={participantMap}
                            isLayeredView={isLayeredView}
                            activityMapping={activityMapping}
                            viewMode={viewMode}  // Add this line
                            key={`${currentTimestep}-${viewMode}-${isLayeredView}`}
                        />
                    </div>
                    <div style={{height:'810px', width: '410px', padding: '10px', overflowY: 'auto', transform:'translateY(-5px)'}}>
                        {centralityMeasures && (
                            <AnalysesPanel
                                centralityMeasures={centralityMeasures}
                                participantMap={participantMap}
                                viewMode={viewMode}
                            />
                        )}
                    </div>
                </div>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    marginTop: '20px'
                }}>
                    <div style={{
                        fontSize: '1.2em',
                        fontWeight: 'bold',
                        color: '#5a5a4f',
                        marginBottom: '10px'
                    }}>
                    </div>
                    <CurrentDateDisplay />

                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: '100%'
                    }}>
                        <div style={{
                            ...neumorphicControlsStyle,
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            border: `2px solid rgba(160, 82, 45, 0.1)`,
                            marginRight: '60px',
                            padding: '10px',
                            maxWidth: '333px'
                        }}>
                            <button
                                onClick={() => setViewMode('SUM')}
                                style={{
                                    ...neumorphicButtonStyle,
                                    width: '72px',
                                    height: '72px',
                                    borderRadius: '100%',
                                    fontSize: '0.9em',
                                    padding: '0',
                                    boxShadow: viewMode === 'SUM'
                                        ? 'none'
                                        : '2px 2px 4px #d1d1b7, -2px -2px 4px #fffff9',
                                    border: viewMode === 'SUM' ? '3px solid rgb(206, 232, 35, .8)' : 'none',
                                    backgroundColor: '#faf7ed'
                                }}
                            >
                                SUM
                            </button>
                            <button
                                onClick={() => setViewMode('SET')}
                                style={{
                                    ...neumorphicButtonStyle,
                                    width: '72px',
                                    height: '72px',
                                    borderRadius: '100%',
                                    fontSize: '0.9em',
                                    padding: '0',
                                    boxShadow: viewMode === 'SET'
                                        ? 'none'
                                        : '2px 2px 4px #d1d1b7, -2px -2px 4px #fffff9',
                                    border: viewMode === 'SET' ? '3px solid rgb(206, 232, 35, .8)' : 'none',
                                    backgroundColor: '#faf7ed'
                                }}
                            >
                                SET
                            </button>
                            <button
                                onClick={() => setIsLayeredView(!isLayeredView)}
                                style={{
                                    ...neumorphicButtonStyle,
                                    width: '72px',
                                    height: '72px',
                                    borderRadius: '100%',
                                    fontSize: '0.9em',
                                    padding: '0',
                                    boxShadow: isLayeredView
                                        ? 'none'
                                        : '2px 2px 4px #d1d1b7, -2px -2px 4px #fffff9',
                                    border: isLayeredView ? '3px solid rgb(206, 232, 35, .8)' : 'none',
                                    backgroundColor: '#faf7ed'
                                }}
                            >
                                CIRC
                            </button>
                        </div>

                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginRight: '700px',  // Adds space on the left
                            maxWidth: '360px'
                        }}>
                            <PlaybackControls
                                data={groupedData}
                                width="auto"
                                style={{
                                    border: `2px solid rgba(160, 82, 45, 0.1)`,
                                    padding: '10px',
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NetPage;