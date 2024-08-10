import React, { useState } from 'react';

const backgroundColor = '#faf7ed';

const neumorphicStyle = {
    backgroundColor: backgroundColor,
    borderRadius: '19px',
    boxShadow: '5px 5px 10px #e6e3da, -5px -5px 10px #ffffff',
    padding: '20px',
    marginTop: '20px',
    transition: 'all 0.3s ease'
};

const neumorphicButtonStyle = {
    backgroundColor: backgroundColor,
    border: 'none',
    borderRadius: '10px',
    boxShadow: '3px 3px 6px #e6e3da, -3px -3px 6px #ffffff',
    cursor: 'pointer',
    fontWeight: 'bold',
    color: '#4a5568',
    margin: '5px',
    padding: '10px 15px',
    transition: 'all 0.3s ease'
};

const AnalysesPanel = ({ centralityMeasures, participantMap }) => {
    const [selectedMeasure, setSelectedMeasure] = useState('degree');
    const [source, setSource] = useState('');
    const [target, setTarget] = useState('');
    const [shortestPath, setShortestPath] = useState(null);

    const measures = [
        { name: 'Degree', value: 'degree' },
        { name: 'Closeness', value: 'closeness' },
        { name: 'Betweenness', value: 'betweenness' },
        { name: 'Eigenvector', value: 'eigenvector' },
        { name: 'Communities', value: 'communities' },
        { name: 'Shortest Path', value: 'shortest_path' },
    ];

    const getChartData = () => {
        if (!centralityMeasures || !centralityMeasures.centrality || !centralityMeasures.centrality[selectedMeasure]) {
            return [];
        }

        return Object.entries(centralityMeasures.centrality[selectedMeasure])
            .map(([id, value]) => ({
                id,
                name: (participantMap && participantMap[id] && participantMap[id].name) ? participantMap[id].name : id,
                value: selectedMeasure === 'communities' ? `Community ${value}` : value
            }))
            .sort((a, b) => selectedMeasure === 'communities' ? a.value.localeCompare(b.value) : b.value - a.value)
            .slice(0, selectedMeasure === 'communities' ? undefined : 10);
    };

    const chartData = getChartData();

    const maxValue = selectedMeasure === 'communities' ? 1 : Math.max(...chartData.map(item => typeof item.value === 'number' ? item.value : 0));
    const minValue = selectedMeasure === 'communities' ? 0 : Math.min(...chartData.map(item => typeof item.value === 'number' ? item.value : 0));

    if (!centralityMeasures || !centralityMeasures.centrality) {
        return <div style={neumorphicStyle}>Loading centrality measures...</div>;
    }

    const scaleValue = (value) => {
        if (selectedMeasure === 'communities') return 1;

        // Ensure a minimum visible width for non-zero values
        const minVisibleWidth = 0.05; // 5% of the total width

        // Calculate the scaled value
        let scaledValue = (value - minValue) / (maxValue - minValue);

        // Apply a non-linear scaling (e.g., square root) to emphasize smaller differences
        scaledValue = Math.sqrt(scaledValue);

        // Ensure the scaled value is at least the minimum visible width for non-zero values
        return value > minValue ? Math.max(scaledValue, minVisibleWidth) : 0;
    };

    const renderBarChart = (item, index) => (
        <div key={index} style={{marginBottom: '10px', display: 'flex', alignItems: 'center'}}>
            <div style={{width: '150px', marginRight: '10px', fontWeight: 'bold', color: '#4a5568'}}>{item.name}</div>
            <div style={{
                flex: 1,
                height: '20px',
                backgroundColor: '#f0eee6',
                position: 'relative',
                borderRadius: '3px', // Very slight border radius for container
                overflow: 'hidden'
            }}>
                <div style={{
                    position: 'absolute',
                    height: '100%',
                    width: `${scaleValue(item.value) * 100}%`,
                    backgroundColor: selectedMeasure === 'communities' ?
                        `hsl(${parseInt(item.value.split(' ')[1]) * 137.508}, 70%, 70%)` : 'rgba(152,54,18,0.81)',
                    transition: 'width 0.3s ease'
                }} />
                <div style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    paddingLeft: '10px',
                    color: '#4a5568',
                    fontWeight: 'bold'
                }}>
                    {typeof item.value === 'number' ? item.value.toFixed(4) : item.value}
                </div>
            </div>
        </div>
    );


    const renderCommunities = () => {
        const communities = chartData.reduce((acc, item) => {
            if (!acc[item.value]) {
                acc[item.value] = [];
            }
            acc[item.value].push(item.name);
            return acc;
        }, {});

        return Object.entries(communities).map(([community, members], index) => (
            <div key={index} style={{marginBottom: '20px'}}>
                <h4 style={{color: '#4a5568'}}>{community}</h4>
                <div style={{display: 'flex', flexWrap: 'wrap'}}>
                    {members.map((member, i) => (
                        <span key={i} style={{
                            // backgroundColor: `hsl(${parseInt(community.split(' ')[1]) * 137.508}, 70%, 70%)`,
                            padding: '5px 10px',
                            margin: '2px',
                            borderRadius: '3px',
                            color: '#4a5568'
                        }}>
                            {member}
                        </span>
                    ))}
                </div>
            </div>
        ));
    };

    const fetchShortestPath = async () => {
        try {
            const response = await fetch(`http://localhost:5001/api/shortest-path?source=${source}&target=${target}`);
            const data = await response.json();
            if (response.ok) {
                setShortestPath(data);
            } else {
                setShortestPath({ error: data.error });
            }
        } catch (error) {
            setShortestPath({ error: 'Failed to fetch shortest path' });
        }
    };

    const renderShortestPath = () => (
        <div>
            <div style={{ marginBottom: '10px' }}>
                <input
                    type="text"
                    placeholder="Source node"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    style={neumorphicStyle}
                />
                <input
                    type="text"
                    placeholder="Target node"
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    style={{ ...neumorphicStyle, marginLeft: '10px' }}
                />
                <button onClick={fetchShortestPath} style={{ ...neumorphicButtonStyle, marginLeft: '10px' }}>
                    Find Shortest Path
                </button>
            </div>
            {shortestPath && (
                <div>
                    {shortestPath.error ? (
                        <p style={{ color: 'red' }}>{shortestPath.error}</p>
                    ) : (
                        <div>
                            <p>Shortest Path: {shortestPath.path.join(' → ')}</p>
                            <p>Path Length: {shortestPath.length}</p>
                        </div>
                    )}
                </div>
            )}
            {centralityMeasures.centrality.avg_shortest_path && (
                <div style={{ marginTop: '20px' }}>
                    <h4>Average Shortest Path Length: {centralityMeasures.centrality.avg_shortest_path.toFixed(4)}</h4>
                </div>
            )}
        </div>
    );

    return (
        <div style={neumorphicStyle}>
            <h3 style={{color: '#333', marginBottom: '26px'}}>Analyses</h3>
            <div style={{display: 'flex', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '20px'}}>
                {measures.map(measure => (
                    <button
                        key={measure.value}
                        onClick={() => setSelectedMeasure(measure.value)}
                        style={{
                            ...neumorphicButtonStyle,
                            boxShadow: selectedMeasure === measure.value
                                ? 'inset 3px 3px 6px #e6e3da, inset -3px -3px 6px #ffffff'
                                : '3px 3px 6px #e6e3da, -3px -3px 6px #ffffff'
                        }}
                    >
                        {measure.name}
                    </button>
                ))}
            </div>
            {selectedMeasure === 'shortest_path' ? (
                renderShortestPath()
            ) : chartData.length > 0 ? (
                <div style={{marginTop: '20px'}}>
                    {selectedMeasure === 'communities'
                        ? renderCommunities()
                        : chartData.map(renderBarChart)
                    }
                </div>
            ) : (
                <div>No data available for the selected measure.</div>
            )}
        </div>
    );
};

export default AnalysesPanel;