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

const SimplifiedOlogView = ({ groupedData, currentDataIndex }) => {
    const containerRef = useRef(null);

    useEffect(() => {
        if (containerRef.current && groupedData.length > 0) {
            const currentDayData = groupedData[currentDataIndex]?.activities || [];
            const container = containerRef.current;
            container.innerHTML = '';

            const createOlogGraph = (currentData, index) => {
                const div = document.createElement('div');
                div.style.width = '333px';
                div.style.height = '230px';
                div.style.display = 'inline-block';
                div.style.margin = '10px';
                container.appendChild(div);

                const nodes = new DataSet();
                const edges = new DataSet();

                const activityColor = getActivityColor(currentData.ActivityType);

                const options = {
                    nodes: {
                        shape: 'box',
                        size: 30,  // Set a fixed size for all nodes
                        font: {
                            size: 14,
                            color: '#ffffff',
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
                            borderRadius: 6
                        },
                        margin: 8,
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
                            forceDirection: 'horizontal',
                            roundness: 0.2
                        },
                        arrows: {
                            to: {
                                enabled: false
                            }
                        }
                    },
                    layout: {
                        hierarchical: {
                            direction: 'LR',
                            sortMethod: 'directed',
                            nodeSpacing: 100,
                            levelSeparation: 150
                        }
                    },
                    physics: false,
                    interaction: {
                        dragNodes: false,
                        dragView: false,
                        zoomView: false,
                        selectable: false,
                        hover: false
                    }
                };

                const addNode = (id, label, level) => {
                    nodes.add({
                        id,
                        label,
                        level,
                        fixed: true
                    });
                };

                const addEdge = (from, to) => {
                    edges.add({ from, to });
                };

                addNode(currentData.ActivityType, getActivityLabel(currentData.ActivityType), 0);

                const envNodes = new Map();

                currentData.Sequence.forEach((seq, index) => {
                    addNode(`${seq.Action}_${index}`, seq.Action, 1);
                    addEdge(currentData.ActivityType, `${seq.Action}_${index}`);

                    // Add and connect environment nodes
                    const envItem = seq.Material || seq.Topic;
                    if (envItem) {
                        if (!envNodes.has(envItem)) {
                            const envNodeId = `env_${envNodes.size}`;
                            addNode(envNodeId, envItem, 2);
                            envNodes.set(envItem, envNodeId);
                        }
                        addEdge(`${seq.Action}_${index}`, envNodes.get(envItem));
                    }
                });

                // Add any remaining environment items
                [currentData.MaterialUsed, currentData.ServiceProjectType].filter(Boolean).forEach(item => {
                    if (!envNodes.has(item)) {
                        const envNodeId = `env_${envNodes.size}`;
                        addNode(envNodeId, item, 2);
                        envNodes.set(item, envNodeId);
                        // Connect to the last action node if there's no specific connection
                        const lastActionNode = `${currentData.Sequence[currentData.Sequence.length - 1].Action}_${currentData.Sequence.length - 1}`;
                        addEdge(lastActionNode, envNodeId);
                    }
                });

                const network = new Network(div, { nodes, edges }, options);

                // Pre-calculate positions
                const containerWidth = div.clientWidth;
                const containerHeight = div.clientHeight;
                const levels = { 0: [], 1: [], 2: [] };

                nodes.forEach(node => {
                    levels[node.level].push(node);
                });

                Object.keys(levels).forEach(level => {
                    const nodesInLevel = levels[level];
                    const x = (containerWidth / 3) * level + containerWidth / 6;
                    nodesInLevel.forEach((node, index) => {
                        const y = (containerHeight / (nodesInLevel.length + 1)) * (index + 1);
                        nodes.update({ id: node.id, x, y, fixed: { x: true, y: true } });
                    });
                });

                network.setData({ nodes, edges });
                network.fit({ animation: false });
            };

            currentDayData.forEach(createOlogGraph);
        }
    }, [groupedData, currentDataIndex]);

    return (
        <div ref={containerRef} style={{ height: '100%', width: '100%', overflowY: 'auto', padding: '5px' }}></div>
    );
};

export default SimplifiedOlogView;