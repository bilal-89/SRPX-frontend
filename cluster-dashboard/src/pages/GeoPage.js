import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, CircleMarker, Polygon, Popup, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import GeoAnalysesPanel from './GeoAnalysesPanel';
import QueryInputs from '../components/dashboard/QueryInputs';
import { neumorphicStyle, neumorphicButtonStyle } from '../styles/globalStyles';
import { useQuery } from '../context/QueryContext';

const backgroundColor = '#faf7ed';

const activityColors = {
    'JYG': '#8B4513',
    'Study Circle': '#556B2F',
    'Children\'s Class': '#4682B4'
};

const DynamicMarkers = ({ activities }) => {
    const [opacity, setOpacity] = useState(0.8);

    useEffect(() => {
        const interval = setInterval(() => {
            setOpacity(prev => prev === 0.8 ? 0.4 : 0.8);
        }, 500);

        return () => clearInterval(interval);
    }, []);

    return (
        <>
            {activities.map((item, index) => (
                <CircleMarker
                    key={`${item.Date}-${index}`}
                    center={[item.Latitude, item.Longitude]}
                    radius={Math.sqrt(item.ActivitySize || 1) * 3}
                    fillColor={activityColors[item.ActivityType] || '#ff7800'}
                    color={activityColors[item.ActivityType] || '#ff7800'}
                    weight={1}
                    opacity={1}
                    fillOpacity={opacity}
                >
                    <Popup>
                        Date: {item.Date}<br/>
                        Activity: {item.ActivityType}<br/>
                        Size: {item.ActivitySize}<br/>
                        Material: {item.MaterialUsed || 'N/A'}
                    </Popup>
                </CircleMarker>
            ))}
        </>
    );
};

const OverlayLayer = ({ data, overlay, getOverlayColor }) => {
    if (!data || !data.features) return null;

    return data.features.map((feature, index) => {
        if (!feature.geometry || !feature.geometry.coordinates || feature.geometry.coordinates.length === 0) {
            console.warn(`Invalid geometry for feature ${index}`);
            return null;
        }

        let coordinates;
        if (feature.geometry.type === "Polygon") {
            coordinates = feature.geometry.coordinates[0].map(coord => [coord[1], coord[0]]); // Swap lat and lng
        } else {
            console.warn(`Unsupported geometry type for feature ${index}: ${feature.geometry.type}`);
            return null;
        }

        const value = feature.properties[overlay] || 0;
        const color = getOverlayColor(value, overlay);

        return (
            <Polygon
                key={`overlay-${index}`}
                positions={coordinates}
                pathOptions={{
                    fillColor: color,
                    color: color,
                    weight: 1,
                    opacity: 0.8,
                    fillOpacity: 0.5
                }}
            >
                <Popup>
                    {overlay}: {value}
                </Popup>
            </Polygon>
        );
    }).filter(Boolean);
};

const getOverlayColor = (value, overlay) => {
    const scales = {
        age: ['#FFA07A', '#FA8072', '#E9967A', '#F08080', '#CD5C5C', '#DC143C', '#B22222', '#8B0000'],
        density: ['#E6F3FF', '#C6E2FF', '#95CAFF', '#69B3FF', '#429CFF', '#1C85FF', '#0066CC', '#004C99'],
        income: ['#E6FFE6', '#C6FFC6', '#95FF95', '#69FF69', '#42FF42', '#1CFF1C', '#00CC00', '#009900']
    };

    const scale = scales[overlay] || scales.age; // Default to age scale if overlay is not recognized
    const maxValue = getMaxValue(overlay);
    const index = Math.floor(((value || 0) / maxValue) * (scale.length - 1));
    return scale[Math.max(0, Math.min(scale.length - 1, index))];
};

const getMaxValue = (overlay) => {
    const maxValues = {
        age: 100,
        density: 10000,
        income: 200000
    };
    return maxValues[overlay] || 100;
};

const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}-${date.getDate() + 1}-${date.getFullYear()}`;
};

const GeoPage = () => {
    const navigate = useNavigate();
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const { queryParams, updateQueryParams, currentTimestep, updateCurrentTimestep } = useQuery();
    const [mapReady, setMapReady] = useState(false);
    const mapContainerRef = useRef(null);
    const defaultPosition = [39.9487, -75.2344]; // Center of Philadelphia
    const defaultZoom = 10.9;

    const [data, setData] = useState([]);
    const [selectedOverlay, setSelectedOverlay] = useState(null);
    const [overlayData, setOverlayData] = useState(null);

    useEffect(() => {
        fetchData(queryParams);
    }, [queryParams]);

    const fetchData = async (params) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`http://localhost:5001/api/unified-data?${new URLSearchParams(params)}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const fetchedData = await response.json();
            setData(fetchedData);
        } catch (error) {
            console.error('Error fetching data:', error);
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchOverlayData = async (overlay) => {
        setIsLoading(true);
        try {
            const response = await fetch(`http://localhost:5001/api/census-data?overlay=${overlay}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log('Received overlay data:', data);
            setOverlayData(data);
        } catch (error) {
            console.error('Error fetching overlay data:', error);
            setError(error.message);
            setOverlayData(null);  // Set overlayData to null if there's an error
        } finally {
            setIsLoading(false);
        }
    };

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

    const currentActivities = useMemo(() => {
        return groupedData[currentDataIndex]?.activities || [];
    }, [groupedData, currentDataIndex]);

    useEffect(() => {
        if (groupedData.length > 0 && !groupedData.find(item => item.date === currentTimestep)) {
            updateCurrentTimestep(groupedData[0].date);
        }
    }, [groupedData, currentTimestep, updateCurrentTimestep]);

    useEffect(() => {
        let interval;
        if (isPlaying) {
            interval = setInterval(() => {
                updateCurrentTimestep(prevDate => {
                    const currentIndex = groupedData.findIndex(item => item.date === prevDate);
                    const nextIndex = (currentIndex + 1) % groupedData.length;
                    return groupedData[nextIndex].date;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isPlaying, groupedData, updateCurrentTimestep]);

    useEffect(() => {
        if (mapContainerRef.current) {
            setMapReady(true);
        }
    }, []);

    const handleExplicitQuery = (newParams) => {
        updateQueryParams(newParams);
        fetchData(newParams);
    };

    const handleButtonRelease = (action) => {
        if (action === 'previous') {
            updateCurrentTimestep(prevDate => {
                const currentIndex = groupedData.findIndex(item => item.date === prevDate);
                const prevIndex = (currentIndex - 1 + groupedData.length) % groupedData.length;
                return groupedData[prevIndex].date;
            });
        } else if (action === 'play') {
            setIsPlaying(!isPlaying);
        } else if (action === 'next') {
            updateCurrentTimestep(prevDate => {
                const currentIndex = groupedData.findIndex(item => item.date === prevDate);
                const nextIndex = (currentIndex + 1) % groupedData.length;
                return groupedData[nextIndex].date;
            });
        }
    };

    const handleOverlayChange = (overlay) => {
        if (overlay === selectedOverlay) {
            // If the same overlay is clicked again, turn it off
            setSelectedOverlay(null);
            setOverlayData(null);
        } else {
            // If a new overlay is selected, fetch its data
            setSelectedOverlay(overlay);
            if (overlay) {
                fetchOverlayData(overlay);
            } else {
                setOverlayData(null);
            }
        }
    };

    return (
        <div style={{padding: '20px', backgroundColor: backgroundColor, minHeight: '100vh'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                <button onClick={() => navigate('/')} style={neumorphicButtonStyle}>
                    Back to Overview
                </button>
                <h2 style={{color: '#333', margin: '0'}}>Geographic View</h2>
                <div style={{width: '150px'}}></div>
            </div>
            <QueryInputs onExplicitQuery={handleExplicitQuery}/>
            <div style={{display: 'flex', marginTop: '20px'}}>
                <div style={{flex: 1, ...neumorphicStyle, height: '60vh'}}>
                    {mapReady ? (
                        <MapContainer
                            center={defaultPosition}
                            zoom={defaultZoom}
                            style={{height: "100%", width: "100%"}}
                            zoomControl={false}
                        >
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
                            <ZoomControl position="topleft"/>
                            {currentActivities.length > 0 && <DynamicMarkers activities={currentActivities}/>}
                            {selectedOverlay && overlayData && (
                                <OverlayLayer
                                    data={overlayData}
                                    overlay={selectedOverlay}
                                    getOverlayColor={getOverlayColor}
                                />
                            )}
                        </MapContainer>
                    ) : (
                        <div ref={mapContainerRef} style={{height: "100%", width: "100%"}}></div>
                    )}
                </div>
                <div style={{width: '350px', marginLeft: '20px', ...neumorphicStyle}}>
                    <GeoAnalysesPanel onOverlayChange={handleOverlayChange} selectedOverlay={selectedOverlay} />
                </div>
            </div>
            <div style={{display: 'flex', justifyContent: 'center', marginTop: '20px'}}>
                <button
                    onClick={() => handleButtonRelease('previous')}
                    style={{...neumorphicButtonStyle, margin: '0 5px'}}
                >
                    Previous
                </button>
                <button
                    onClick={() => handleButtonRelease('play')}
                    style={{...neumorphicButtonStyle, margin: '0 5px'}}
                >
                    {isPlaying ? 'Pause' : 'Play'}
                </button>
                <button
                    onClick={() => handleButtonRelease('next')}
                    style={{...neumorphicButtonStyle, margin: '0 5px'}}
                >
                    Next
                </button>
            </div>
            <div style={{textAlign: 'center', marginTop: '10px', color: '#4a5568'}}>
                Current Date: {currentTimestep ? formatDate(currentTimestep) : 'N/A'}
            </div>
            {isLoading && <p>Loading data...</p>}
            {error && <p style={{color: 'red'}}>Error: {error}</p>}
        </div>
    );
};

export default GeoPage;