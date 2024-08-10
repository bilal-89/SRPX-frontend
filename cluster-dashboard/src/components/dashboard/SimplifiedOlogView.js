import React, { useEffect, useRef } from 'react';
import { Network } from 'vis-network/standalone';
import { DataSet } from 'vis-data/standalone';

const activityMapping = {
    'Study Circle': { color: 'rgb(130, 168, 2, 0.81)', label: 'SC' },
    'Devotional': { color: 'rgb(184, 2, 75, 0.81)', label: 'DEV' },
    'Home Visit': { color: 'rgb(245, 45, 5, 0.81)', label: 'HV' },
    "Children's Class": { color: 'rgb(270, 110, 2, 0.81)', label: 'CC' },
    'JYG': { color: 'rgb(195, 122, 255, 0.81)', label: 'JYG' },
    'Nucleus':{ color: 'rgba(152,54,18,0.9)', label: 'NUC' }

};

const getActivityColor = (activityType) => {
    return activityMapping[activityType]?.color || 'rgba(194, 178, 128, 0.6)';
};

const getActivityLabel = (activityType) => {
    return activityMapping[activityType]?.label || activityType;
};

const calculateNodeSize = (activitySize, minSize = 60, maxSize = 100) => {
    const baseSize = Math.sqrt(activitySize) * 6;
    return Math.min(Math.max(baseSize, minSize), maxSize);
};

const SimplifiedOlogView = ({ groupedData, currentDataIndex }) => {
    const containerRef = useRef(null);

    useEffect(() => {
        if (containerRef.current && groupedData.length > 0) {
            const currentDayData = groupedData[currentDataIndex]?.activities || [];
            const container = containerRef.current;
            container.innerHTML = '';

            const createOlogGraph = (currentData, index) => {
                const div = document.createElement('div');
                div.style.width = '320px';
                div.style.height = '240px';
                div.style.display = 'inline-block';
                div.style.margin = '10px';
                container.appendChild(div);

                const nodes = new DataSet();
                const edges = new DataSet();

                const activityColor = getActivityColor(currentData.ActivityType);

                const options = {
                    nodes: {
                        shape: 'box',
                        font: {
                            size: 20,
                            color: '#ffffff',  // White text for better contrast
                            face: 'Courier, sans-serif',
                            bold: true
                        },
                        borderWidth: 1,
                        shadow: {
                            enabled: true,
                            color: 'rgba(0,0,0,0.1)',
                            size: 3,
                            x: 2,
                            y: 2
                        },
                        shapeProperties: {
                            borderRadius: 8
                        },
                        margin: 14,
                        color: {
                            background: activityColor,
                            border: activityColor,
                            highlight: {
                                background: activityColor,
                                border: activityColor
                            },
                            hover: {
                                background: activityColor,
                                border: activityColor
                            }
                        }
                    },
                    edges: {
                        color: activityColor,
                        width: 2,
                        smooth: {
                            type: 'cubicBezier',
                            forceDirection: 'vertical',
                            roundness: 0.3
                        }
                    },
                    layout: {
                        hierarchical: {
                            direction: 'UD',
                            sortMethod: 'directed',
                            nodeSpacing: 144,
                            levelSeparation: 140
                        }
                    },
                    physics: true,
                    interaction: {
                        dragNodes: true,
                        dragView: false,
                        zoomView: false,
                        selectable: false,
                        hover: false
                    }
                };

                const addNode = (id, label, level, size = null, isActivity = false) => {
                    nodes.add({
                        id,
                        label,
                        level,
                        size: isActivity ? size : undefined,
                        font: {
                            size: isActivity ? 36 : 20,
                        },
                    });
                };

                const addEdge = (from, to) => {
                    edges.add({ from, to });
                };

                const size = calculateNodeSize(currentData.ActivitySize);
                addNode(currentData.ActivityType, getActivityLabel(currentData.ActivityType), 0, size, true);

                currentData.Sequence.forEach((seq, index) => {
                    addNode(`${seq.Action}_${index}`, seq.Action, 1);
                    addEdge(currentData.ActivityType, `${seq.Action}_${index}`);
                });

                const environmentItems = [
                    currentData.MaterialUsed,
                    currentData.ServiceProjectType
                ].filter(Boolean);

                environmentItems.forEach((item, index) => {
                    addNode(`env_${index}`, item, 2);
                    addEdge(
                        `${currentData.Sequence[currentData.Sequence.length - 1].Action}_${currentData.Sequence.length - 1}`,
                        `env_${index}`
                    );
                });

                new Network(div, { nodes, edges }, options);
            };

            currentDayData.forEach(createOlogGraph);
        }
    }, [groupedData, currentDataIndex]);

    return (
        <div ref={containerRef} style={{ height: '100%', width: '100%', overflowY: 'auto', padding: '5px' }}></div>
    );
};

export default SimplifiedOlogView;