import React, { useEffect, useRef, useState, useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, ZoomControl } from 'react-leaflet';

const activityColors = {
    'Study Circle': 'rgb(130, 168, 2, 0.81)',
    'Devotional': 'rgb(184, 2, 75, 0.81)',
    'Home Visit': 'rgb(245, 45, 5, 0.81)',
    "Children's Class": 'rgb(270, 110, 2, 0.81)',
    'JYG': 'rgb(195, 122, 255, 0.81)',
    'Nucleus':'rgba(152,54,18,0.9)', label: 'NUC'

};

const DynamicMarkers = ({ activities, isPlaying }) => {
    return (
        <>
            {activities.map((item, index) => (
                <CircleMarker
                    key={`${item.Date}-${index}`}
                    center={[item.Latitude, item.Longitude]}
                    radius={Math.sqrt(item.ActivitySize || 1) * 5.4}
                    fillColor={activityColors[item.ActivityType] || 'rgb(135, 104, 71)'}
                    color="transparent"
                    weight={0}
                    opacity={1}
                    fillOpacity={0}
                    eventHandlers={{
                        add: (e) => {
                            const marker = e.target;
                            if (isPlaying) {
                                marker._path.classList.add('fade-in-out');
                            } else {
                                marker._path.classList.add('fade-in');
                            }
                        },
                        remove: (e) => {
                            const marker = e.target;
                            marker._path.classList.remove('fade-in', 'fade-in-out');
                            marker._path.classList.add('fade-out');
                        }
                    }}
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

const MapView = ({ groupedData, currentDataIndex, isPlaying }) => {
    const [mapReady, setMapReady] = useState(false);
    const mapContainerRef = useRef(null);
    const defaultPosition = [39.9950,-75.1652];
    const defaultZoom = 11;

    useEffect(() => {
        if (mapContainerRef.current) {
            setMapReady(true);
        }
    }, []);

    const currentActivities = useMemo(() => {
        return groupedData[currentDataIndex]?.activities || [];
    }, [groupedData, currentDataIndex]);

    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn {
                from { fill-opacity: 0; }
                to { fill-opacity: 0.9; }
            }
            @keyframes fadeOut {
                from { fill-opacity: 0.9; }
                to { fill-opacity: 0; }
            }
            @keyframes fadeInOut {
                0% { fill-opacity: 0; }
                50% { fill-opacity: 0.9; }
                100% { fill-opacity: 0; }
            }
            .fade-in {
                animation: fadeIn 0.2s ease-in forwards;
            }
            .fade-out {
                animation: fadeOut 0.2s ease-out infinite;
            }
            .fade-in-out {
                animation: fadeInOut 0.2s ease-in-out infinite;
            }
        `;
        document.head.appendChild(style);

        return () => {
            document.head.removeChild(style);
        };
    }, []);

    if (!mapReady) return <div ref={mapContainerRef} style={{height: "100%", width: "100%"}}></div>;

    return (
        <MapContainer
            center={defaultPosition}
            zoom={11}
            style={{height: "100%", width: "100%"}}
            zoomControl={false}
        >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
            <ZoomControl position="topleft" />
            {currentActivities.length > 0 &&
                <DynamicMarkers
                    activities={currentActivities}
                    isPlaying={isPlaying}
                />
            }
        </MapContainer>
    );
};

export default MapView;