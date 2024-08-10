import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Network } from 'vis-network/standalone';
import { DataSet } from 'vis-data/standalone';
import PropTypes from 'prop-types';

const NetworkView = React.memo(({ networkRef, data, onElementClick, activityMapping, viewMode, isLayeredView, participantMap }) => {
    const [network, setNetwork] = useState(null);

    const blendColors = (colors) => {
        console.log("Blending colors:", colors);  // Debug log
        let r = 0, g = 0, b = 0, a = 0, total = 0;
        colors.forEach(({ color, count }) => {
            const [rr, gg, bb, aa] = color.match(/\d+/g).map(Number);
            r += rr * rr * count;
            g += gg * gg * count;
            b += bb * bb * count;
            a += aa * count;
            total += count;
        });
        // Ensure alpha is not 0 by using a minimum value of 0.1
        const alpha = Math.max(a / total / 255, 0.4);
        const blendedColor = `rgba(${Math.sqrt(r / total)}, ${Math.sqrt(g / total)}, ${Math.sqrt(b / total)}, ${alpha})`;
        console.log("Blended color:", blendedColor);  // Debug log
        return blendedColor;
    };

    const getBlendedColor = (activities) => {
        console.log("Activities for blending:", activities);  // Debug log
        const colors = Object.entries(activities).map(([type, count]) => ({
            color: activityMapping[type]?.color || 'rgba(132, 132, 132, 0.9)',
            count
        }));

        if (colors.length === 0) {
            return 'rgba(132, 132, 132, 0.6)'; // Default color if no activities
        }

        return blendColors(colors);
    };

    const { nodes, edges } = useMemo(() => {
        const nodes = new DataSet();
        const edges = new DataSet();

        if (Array.isArray(data) && data.length > 0) {
            console.log("View mode:", viewMode);  // Debug log
            console.log("Data:", data);  // Debug log

            if (viewMode === 'SUM') {
                const item = data[0];
                const participantIDs = item.ParticipantIDs ? item.ParticipantIDs.split(',') : [];
                const participantActivities = item.ParticipantActivities || {};

                participantIDs.forEach((id) => {
                    const activities = participantActivities[id] || {};
                    console.log(`Activities for participant ${id}:`, activities);  // Debug log
                    const blendedColor = getBlendedColor(activities);
                    const participantInfo = participantMap[id] || {};

                    nodes.add({
                        id: id,
                        label: participantInfo.name || id,
                        color: {
                            background: blendedColor,
                            border: blendedColor,
                            highlight: {
                                background: 'rgb(250,247,237)',
                                border: blendedColor
                            }
                        },
                        borderWidth: 2,
                        shadow: {
                            enabled: true,
                            color: 'rgba(0,0,0,0.2)',
                            size: 5,
                            x: 2,
                            y: 2
                        }
                    });
                });

                (item.Connections || []).forEach((connection) => {
                    const [from, to] = connection.key.split('-');
                    const activities = connection.activities || {};
                    console.log(`Activities for connection ${connection.key}:`, activities);  // Debug log
                    const blendedColor = getBlendedColor(activities);

                    edges.add({
                        id: connection.key,
                        from: from,
                        to: to,
                        color: { color: blendedColor, highlight: blendedColor, hover: blendedColor }
                    });
                });
            } else {
                data.forEach((item) => {
                    const participantIDs = item.ParticipantIDs ? item.ParticipantIDs.split(',') : [];
                    const participantNames = item.ParticipantNames ? item.ParticipantNames.split(',') : [];
                    const participantRoles = item.ParticipantRoles ? item.ParticipantRoles.split(',') : [];
                    const activityType = item.ActivityType || 'Unknown';
                    const activityColor = activityMapping && activityMapping[activityType] ? activityMapping[activityType].color : '#848484';

                    participantIDs.forEach((id, i) => {
                        if (!nodes.get(id)) {
                            const role = participantRoles[i] || 'Unknown';
                            const isParticipant = role.toLowerCase() === 'participant';
                            const borderWidth = isParticipant ? 1 : 2;
                            nodes.add({
                                id: id,
                                label: participantNames[i] || id,
                                group: role,
                                color: {
                                    background: activityColor,
                                    border: activityColor,
                                    highlight: {
                                        background: 'rgb(250,247,237)',
                                        border: activityColor
                                    }
                                },
                                borderWidth: borderWidth,
                                shadow: {
                                    enabled: true,
                                    color: 'rgba(0,0,0,0.2)',
                                    size: 5,
                                    x: 2,
                                    y: 2
                                },
                                isParticipant: isParticipant
                            });
                        }

                        for (let j = i + 1; j < participantIDs.length; j++) {
                            const relationshipKey = [id, participantIDs[j]].sort().join('-');
                            if (!edges.get(relationshipKey)) {
                                edges.add({
                                    id: relationshipKey,
                                    from: id,
                                    to: participantIDs[j],
                                    color: { color: activityColor, highlight: activityColor, hover: activityColor },
                                    activityType: activityType
                                });
                            }
                        }
                    });
                });
            }
        }

        return { nodes, edges };
    }, [data, activityMapping, viewMode, participantMap]);

    const handleClick = useCallback((params) => {
        if (typeof onElementClick === 'function') {
            if (params.nodes.length > 0) {
                const nodeId = params.nodes[0];
                const node = nodes.get(nodeId);
                onElementClick({ type: 'node', data: node });
            } else if (params.edges.length > 0) {
                const edgeId = params.edges[0];
                const edge = edges.get(edgeId);
                onElementClick({ type: 'edge', data: edge });
            } else {
                onElementClick(null);
            }
        }
    }, [nodes, edges, onElementClick]);

    useEffect(() => {
        if (networkRef.current && nodes && edges) {
            const options = {
                nodes: {
                    shape: 'dot',
                    size: 20,
                    font: {
                        size: 12,
                        color: '#000000',
                        face: 'Maname',
                        strokeWidth: 2,
                        strokeColor: '#ffffff'
                    },
                    shadow: {
                        enabled: true,
                        color: 'rgba(0,0,0,0.2)',
                        size: 5,
                        x: 2,
                        y: 2
                    }
                },
                edges: {
                    width: 2,
                    smooth: {
                        type: 'continuous'
                    },
                    color: {
                        inherit: false
                    }
                },
                physics: {
                    forceAtlas2Based: {
                        gravitationalConstant: -50,
                        centralGravity: 0.0045,
                        springLength: 109,
                        springConstant: 0.08
                    },
                    maxVelocity: 50,
                    solver: 'forceAtlas2Based',
                    timestep: 0.6,
                    stabilization: { iterations: 150 }
                },
                interaction: { hover: false, zoomView: false, dragView: true }
            };

            if (network) {
                network.setData({ nodes, edges });
            } else {
                const newNetwork = new Network(networkRef.current, { nodes, edges }, options);
                setNetwork(newNetwork);
                newNetwork.on("click", handleClick);
            }
        }
    }, [networkRef, nodes, edges, network, handleClick]);

    return (
        <div ref={networkRef} style={{
            height: "100%",
            width: "100%",
            border: 'none',
            outline: 'none'
        }}></div>
    );
});

NetworkView.propTypes = {
    networkRef: PropTypes.object.isRequired,
    data: PropTypes.array.isRequired,
    onElementClick: PropTypes.func,
    activityMapping: PropTypes.object,
    viewMode: PropTypes.string.isRequired,
    isLayeredView: PropTypes.bool,
    participantMap: PropTypes.object
};

export default NetworkView;