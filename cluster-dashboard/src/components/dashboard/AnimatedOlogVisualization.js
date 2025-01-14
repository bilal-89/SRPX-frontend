import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Network } from 'vis-network/standalone';
import { DataSet } from 'vis-data/standalone';
import { FaFastBackward, FaBackward, FaPlay, FaPause, FaForward, FaFastForward } from 'react-icons/fa';
import { format, parse } from 'date-fns';

const backgroundColor = '#f0f0d8';
const backgroundColor2 = 'rgb(240, 240, 216, 0.1)';

const neumorphicStyle = {
    borderRadius: '15px',
    boxShadow: '5px 5px 10px #d1d1b7, -5px -5px 10px #fffff9',
    padding: '10px',
    transition: 'all 0.3s ease',
    backgroundColor: backgroundColor
};

const neumorphicStyle2 = {
    borderRadius: '15px',
    boxShadow: '5px 5px 10px #d1d1b7, -5px -5px 10px #fffff9',
    padding: '10px',
    transition: 'all 0.3s ease',
    backgroundColor: backgroundColor2
};

const neumorphicButtonStyle = {
    backgroundColor: backgroundColor,
    border: 'none',
    borderRadius: '10px',
    boxShadow: '3px 3px 6px #d1d1b7, -3px -3px 6px #fffff9',
    cursor: 'pointer',
    fontWeight: 'bold',
    color: '#5a5a4f',
    padding: '10px 20px',
    margin: '0 5px',
    transition: 'all 0.1s ease',
    fontFamily: 'Maname, Arial, sans-serif'
};

const neumorphicControlsStyle = {
    ...neumorphicStyle2,
    width: '40%',
    opacity: '0.7',
    display: 'flex',
    justifyContent: 'center',
    padding: '20px',
    marginTop: '10px',
    marginLeft: 'auto',
    marginRight: 'auto',
    transform: 'translateX(32%)'
};

const flatButtonStyle = {
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 'bold',
    color: '#5a5a4f',
    padding: '10px 20px',
    margin: '0 5px',
    transition: 'all 0.3s ease',
    fontFamily: 'Maname, Arial, sans-serif'
};

const convertDateFormat = (dateString) => {
    if (!dateString) return ''; // Return an empty string if dateString is undefined or null

    const parts = dateString.split('-');
    if (parts.length !== 3) return dateString; // Return original string if it's not in the expected format

    const [year, month, day] = parts;
    return `${month.padStart(2, '0')}-${day.padStart(2, '0')}-${year}`;
};

const activityMapping = {
    'Study Circle': { color: 'rgb(130, 168, 2, 0.6)', label: 'SC' },
    'Devotional': { color: 'rgb(184, 2, 75, 0.6)', label: 'DEV' },
    'Home Visit': { color: 'rgb(245, 45, 5, 0.6)', label: 'HV' },
    "Children's Class": { color: 'rgb(270, 110, 2, 0.6)', label: 'CC' },
    'JYG': { color: 'rgb(195, 122, 255, 0.5)', label: 'JYG' },
    'Nucleus': { color: 'rgba(152,54,18,0.9)', label: 'NUC' }
};

const getActivityColor = (activityType) => {
    return activityMapping[activityType]?.color || 'rgba(194, 178, 128, 0.6)';
};

const getActivityLabel = (activityType) => {
    return activityMapping[activityType]?.label || activityType;
};

const AnimatedOlogVisualization = ({
                                       data,
                                       navigateToOverview,
                                       currentTimestep,
                                       updateCurrentTimestep,
                                       groupedData
                                   }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const networkRefs = useRef([]);
    const [viewMode, setViewMode] = useState('SET');
    const [pressedButton, setPressedButton] = useState(null);

    const currentDateIndex = useMemo(() => groupedData.findIndex(item => item.date === currentTimestep), [groupedData, currentTimestep]);
    const currentDateData = useMemo(() => groupedData[currentDateIndex] || { date: '', activities: [] }, [groupedData, currentDateIndex]);

    const calculateNodeSize = (activitySize, minSize = 30, maxSize = 60) => {
        const baseSize = Math.sqrt(activitySize) * 5; // Adjust this multiplier as needed
        return Math.min(Math.max(baseSize, minSize), maxSize);
    };

    const mergeActivities = (activities) => {
        const mergedActivity = {
            Activities: activities.map(a => a.ActivityType),
            Actions: new Set(),
            Environment: new Set(),
            TotalParticipants: 0,
            ActivitySizes: [],  // Add this line
        };

        activities.forEach(activity => {
            activity.Sequence.forEach(seq => {
                mergedActivity.Actions.add(seq.Action);
                if (seq.Material) mergedActivity.Environment.add(seq.Material);
                if (seq.Topic) mergedActivity.Environment.add(seq.Topic);
            });
            if (activity.MaterialUsed) mergedActivity.Environment.add(activity.MaterialUsed);
            if (activity.ServiceProjectType) mergedActivity.Environment.add(activity.ServiceProjectType);
            mergedActivity.TotalParticipants += activity.ActivitySize;
            mergedActivity.ActivitySizes.push(activity.ActivitySize);  // Add this line
        });

        mergedActivity.Actions = Array.from(mergedActivity.Actions);
        mergedActivity.Environment = Array.from(mergedActivity.Environment);

        return mergedActivity;
    };

    const updateVisualization = (activityData, network) => {
        if (!network) return;

        const nodes = network.body.data.nodes;
        const edges = network.body.data.edges;

        nodes.clear();
        edges.clear();

        const calculateNodeSize = (activitySize, minSize = 60, maxSize = 100) => {
            const baseSize = Math.sqrt(activitySize) * 6;
            return Math.min(Math.max(baseSize, minSize), maxSize);
        };

        const mixColors = (colors) => {
            if (colors.length === 1) return colors[0];
            const rgb = colors.reduce((acc, color) => {
                const [r, g, b] = color.match(/\d+/g).map(Number);
                return [acc[0] + r, acc[1] + g, acc[2] + b];
            }, [0, 0, 0]);
            const [r, g, b] = rgb.map(v => Math.round(v / colors.length));
            return `rgb(${r}, ${g}, ${b}, 0.2)`;
        };

        const addNode = (id, label, level, colors, size = null, isActivity = false) => {
            const mixedColor = mixColors(colors);
            nodes.add({
                id,
                label,
                title: label,
                level,
                shape: 'box',
                color: {
                    background: mixedColor,
                    border: mixedColor,
                    highlight: {
                        background: mixedColor,
                        border: mixedColor
                    },
                    hover: {
                        background: mixedColor,
                        border: mixedColor
                    }
                },
                shadow: { enabled: true, color: 'rgba(0,0,0,0.2)', size: 5, x: 3, y: 3 },
                size: isActivity ? size : undefined,
                font: {
                    size: isActivity ? 36 : 20,
                    color: '#ffffff',  // White text for better contrast
                },
            });
        };

        const addEdge = (from, to, color) => {
            edges.add({
                from,
                to,
                color: color,
                connectionType: 'boundingBox',
                smooth: {
                    type: 'straight',
                    forceDirection: 'none'
                },
                arrows: {
                    to: {
                        enabled: false,
                        scaleFactor: 0.5
                    }
                }
            });
        };

        if (Array.isArray(activityData.Activities)) {
            // SUM VIEW
            const activityColors = activityData.Activities.map(getActivityColor);

            // Add activity nodes
            activityData.Activities.forEach((activity, index) => {
                const color = activityColors[index];
                const size = calculateNodeSize(activityData.ActivitySizes[index]);
                addNode(`activity_${index}`, getActivityLabel(activity), 0, [color], size, true);
            });

            // Create a map of actions to their related activities
            const actionMap = new Map();
            activityData.Activities.forEach((activity, index) => {
                activityData.Actions.forEach(action => {
                    if (!actionMap.has(action)) {
                        actionMap.set(action, new Set());
                    }
                    actionMap.get(action).add(index);
                });
            });

            // Add action nodes
            Array.from(actionMap.entries()).forEach(([action, activityIndices], actionIndex) => {
                const actionColors = Array.from(activityIndices).map(index => activityColors[index]);
                addNode(`action_${actionIndex}`, action, 1, actionColors);

                // Connect activities to actions
                activityIndices.forEach(activityIndex => {
                    addEdge(`activity_${activityIndex}`, `action_${actionIndex}`, activityColors[activityIndex]);
                });
            });

            // Create a map of environment items to their related activities
            const envMap = new Map();
            activityData.Activities.forEach((activity, index) => {
                activityData.Environment.forEach(envItem => {
                    if (!envMap.has(envItem)) {
                        envMap.set(envItem, new Set());
                    }
                    envMap.get(envItem).add(index);
                });
            });

            // Add environment nodes
            Array.from(envMap.entries()).forEach(([envItem, activityIndices], envIndex) => {
                const envColors = Array.from(activityIndices).map(index => activityColors[index]);
                addNode(`env_${envIndex}`, envItem, 2, envColors);

                // Connect actions to environment
                Array.from(actionMap.entries()).forEach(([action, actionActivityIndices], actionIndex) => {
                    const commonActivities = new Set([...activityIndices].filter(x => actionActivityIndices.has(x)));
                    if (commonActivities.size > 0) {
                        const edgeColors = Array.from(commonActivities).map(index => activityColors[index]);
                        addEdge(`action_${actionIndex}`, `env_${envIndex}`, mixColors(edgeColors));
                    }
                });
            });

        } else {
            // SET VIEW (keep this part as it was in the previous version)
            const color = getActivityColor(activityData.ActivityType);
            const size = calculateNodeSize(activityData.ActivitySize);
            addNode(activityData.ActivityType, getActivityLabel(activityData.ActivityType), 0, [color], size, true);

            activityData.Sequence.forEach((seq, index) => {
                addNode(`${seq.Action}_${index}`, seq.Action, 1, [color]);
                addEdge(activityData.ActivityType, `${seq.Action}_${index}`, color);
            });

            const environmentItems = [
                activityData.MaterialUsed,
                activityData.ServiceProjectType,
            ].filter(Boolean);

            environmentItems.forEach((item, index) => {
                addNode(`env_${index}`, item, 2, [color]);
                addEdge(
                    `${activityData.Sequence[activityData.Sequence.length - 1].Action}_${activityData.Sequence.length - 1}`,
                    `env_${index}`,
                    color
                );
            });
        }

        network.fit();
    };


    useEffect(() => {
        const activities = currentDateData.activities;
        const dataToVisualize = viewMode === 'SUM' ? [mergeActivities(activities)] : activities;

        dataToVisualize.forEach((activity, index) => {
            if (networkRefs.current[index] && activity) {
                const nodes = new DataSet();
                const edges = new DataSet();

                const options = {
                    nodes: {
                        margin: 26,
                        shape: 'box',
                        font: {
                            size: 26,
                            color: '#faffee',  // White text for better contrast
                            face: 'Courier, sans-serif',
                            bold: true
                        },
                        marginRight: '5px',
                        marginLeft: '5px',
                        borderWidth: 1.2,
                        borderWidthSelected: 2,
                        shadow: {
                            enabled: true,
                            color: 'rgba(0,0,0,0.1)',
                            size: 5,
                            x: 3,
                            y: 3
                        },
                        shapeProperties: {
                            borderRadius: 9
                        },
                        scaling: {
                            min: 50,
                            max: 90,
                            label: {
                                enabled: true,
                                min: 14,
                                max: 24,
                                maxVisible: 24,
                                drawThreshold: 5
                            }
                        },
                        opacity: 1
                    },
                    edges: {
                        width: 2,
                        smooth: {
                            forceDirection: 'vertical',
                            roundness: 0.6
                        },
                        length: 200,
                        shadow: {
                            enabled: true,
                            color: 'rgba(0,0,0,0.05)',
                            size: 3,
                            x: 1,
                            y: 1
                        },
                        connectionType: 'boundingBox'
                    },
                    // ... (keep other options as they are)
                    layout: {
                        hierarchical: {
                            direction: 'UD',
                            sortMethod: 'directed',
                            nodeSpacing: 260,  // Increase this value
                            levelSeparation: 250,  // Increase this value
                            treeSpacing: 250,  // Increase this value
                        },
                        improvedLayout: true,
                    },
                    physics: {
                        enabled: false,
                        hierarchicalRepulsion: {
                            centralGravity: 1.0,
                            springLength: 300,
                            springConstant: 0.01,
                            nodeDistance: 250,
                            damping: 0.09
                        },
                        minVelocity: 0.4,
                        solver: 'hierarchicalRepulsion',
                        stabilization: {
                            enabled: true,
                            iterations: 100,
                            updateInterval: 100,
                            onlyDynamicEdges: false,
                            fit: true
                        },
                    },
                    interaction: {
                        selectable: false,  // Disable node selection
                        selectConnectedEdges: false,
                        dragNodes: true,
                        dragView: false,
                        zoomView: false,
                        navigationButtons: false,
                        keyboard: {
                            enabled: false,
                        },
                    },
                };

                const network = new Network(networkRefs.current[index], { nodes, edges }, options);

                network.on("dragStart", function (params) {
                    network.setOptions({ physics: { enabled: true } });
                });

                network.on("dragEnd", function (params) {
                    network.setOptions({ physics: { enabled: false } });
                });

                updateVisualization(activity, network);
            }
        });
    }, [currentDateData, viewMode]);

    const handleNext = () => {
        const nextIndex = (currentDateIndex + 1) % groupedData.length;
        updateCurrentTimestep(groupedData[nextIndex].date);
    };

    const handlePrevious = () => {
        const prevIndex = (currentDateIndex - 1 + groupedData.length) % groupedData.length;
        updateCurrentTimestep(groupedData[prevIndex].date);
    };

    const handlePlayPause = () => {
        setIsPlaying((prev) => !prev);
    };

    const handleBeginning = () => {
        updateCurrentTimestep(groupedData[0].date);
    };

    const handleEnd = () => {
        updateCurrentTimestep(groupedData[groupedData.length - 1].date);
    };

    useEffect(() => {
        let interval;
        if (isPlaying) {
            interval = setInterval(handleNext, 2000);
        }
        return () => clearInterval(interval);
    }, [isPlaying, currentDateIndex, groupedData]);

    const handleMouseDown = (button) => {
        setPressedButton(button);
    };

    const handleMouseUp = () => {
        setPressedButton(null);
    };

    const handleClick = (newMode) => {
        setViewMode(newMode);
    };

    return (
        <div style={{
            height: '70vh',
            display: 'flex',
            flexDirection: 'column',
            padding: '20px',
            borderRadius: '20px'
        }}>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                height: '85%',
                gap: '20px',
                marginBottom: '20px',
                overflowY: 'auto'
            }}>
                {(viewMode === 'SUM' ? [mergeActivities(currentDateData.activities)] : currentDateData.activities).map((activity, index) => (
                    <div key={index} style={{
                        display: 'flex',
                        height: '300px',
                        gap: '20px',
                        marginBottom: '20px'
                    }}>
                        <div style={{
                            flex: .77,
                            overflowY: 'auto',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                        }}>
                            <h3 style={{color: '#5a5a4f', margin: '0 0 10px 0',
                                fontFamily:'Maname', letterSpacing:'1px'}}>Activity Log</h3>
                            <div style={{flex: 1, overflowY: 'auto',fontFamily:'Courier'}}>
                                {viewMode === 'SUM' ? (
                                    <>
                                        <p>Activities: {activity.Activities.join(', ')}</p>
                                        <p>Actions: {activity.Actions.join(', ')}</p>
                                        <p>Environment: {activity.Environment.join(', ')}</p>
                                        <p>Total Participants: {activity.TotalParticipants}</p>
                                    </>
                                ) : (
                                    activity.Sequence.map((seq, seqIndex) => (
                                        <p key={seqIndex} style={{color: '#5a5a4f'}}>
                                            {seq.Action} - {seq.Material || seq.Topic || 'N/A'}
                                        </p>
                                    ))
                                )}
                            </div>
                        </div>
                        <div ref={el => networkRefs.current[index] = el} style={{
                            flex: 2,
                            height: '100%',
                        }}></div>
                    </div>
                ))}
            </div>

            <div style={{
                fontSize: '1.4em',
                fontWeight: 'bold',
                color: '#5a5a4f',
                textAlign: 'center',
                padding: '0px',
                marginBottom: '5px',
                transform: 'translateX(14%)'
            }}>
                {currentDateData.date ? convertDateFormat(currentDateData.date) : ''}
            </div>

            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                width: '100%',
                marginTop: '10px',
            }}>
                <div style={{
                    ...neumorphicControlsStyle,
                    width: '14%',
                    marginLeft: '370px',
                    transform: 'none',
                    height: '50%',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    border: `2px solid rgba(160, 82, 45, 0.1)`
                }}>
                    <button
                        onMouseDown={() => handleMouseDown('SUM')}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        onClick={() => handleClick('SUM')}
                        style={{
                            ...neumorphicButtonStyle,
                            width: '81px',
                            height: '79px',
                            borderRadius: '100%',
                            fontSize: '1.1em',
                            padding: '0',
                            backgroundColor: backgroundColor,
                            boxShadow: pressedButton === 'SUM' || viewMode === 'SUM'
                                ? 'none'
                                : '2px 2px 4px #d1d1b7, -2px -2px 4px #fffff9',
                            border: viewMode === 'SUM' && pressedButton !== 'SUM'
                                ? '3px solid rgb(206, 232, 35, .8)'
                                : 'none',
                            transition: 'all 0s ease'
                        }}
                    >
                        SUM
                    </button>
                    <button
                        onMouseDown={() => handleMouseDown('SET')}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        onClick={() => handleClick('SET')}
                        style={{
                            ...neumorphicButtonStyle,
                            width: '81px',
                            height: '79px',
                            borderRadius: '100%',
                            fontSize: '1.1em',
                            padding: '0',
                            backgroundColor: backgroundColor,
                            boxShadow: pressedButton === 'SET' || viewMode === 'SET'
                                ? 'none'
                                : '2px 2px 4px #d1d1b7, -2px -2px 4px #fffff9',
                            border: viewMode === 'SET' && pressedButton !== 'SET'
                                ? '3px solid rgb(206, 232, 35, .8)'
                                : 'none',
                            transition: 'all 0s ease'
                        }}
                    >
                        SET
                    </button>
                </div>

                <div style={{
                    ...neumorphicControlsStyle,
                    width: '32%',
                    transform: 'translateX(-29%)',
                    border: `2px solid rgba(160, 82, 45, 0.1)`,
                }}>
                    {['beginning', 'previous', 'playPause', 'next', 'end'].map((control) => (
                        <button
                            key={control}
                            onMouseDown={() => handleMouseDown(control)}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                            onClick={() => {
                                switch (control) {
                                    case 'beginning':
                                        handleBeginning();
                                        break;
                                    case 'previous':
                                        handlePrevious();
                                        break;
                                    case 'playPause':
                                        handlePlayPause();
                                        break;
                                    case 'next':
                                        handleNext();
                                        break;
                                    case 'end':
                                        handleEnd();
                                        break;
                                }
                            }}
                            style={{
                                ...neumorphicButtonStyle,
                                fontSize: '1em',
                                padding: '25px',
                                boxShadow: pressedButton === control
                                    ? 'inset 2px 2px 2px #d1d1b7, inset -2px -2px 2px #fffff9'
                                    : '2px 2px 2px #d1d1b7, -2px -2px 2px #fffff9',
                                transition: 'all 0s ease'
                            }}
                        >
                            {control === 'beginning' && <FaFastBackward/>}
                            {control === 'previous' && <FaBackward/>}
                            {control === 'playPause' && (isPlaying ? <FaPause/> : <FaPlay/>)}
                            {control === 'next' && <FaForward/>}
                            {control === 'end' && <FaFastForward/>}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AnimatedOlogVisualization;