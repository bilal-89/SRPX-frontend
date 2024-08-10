import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const neumorphicStyle = {
    backgroundColor: '#faf7ed',
    borderRadius: '19px',
    boxShadow: '1px 1px 2px #e6dfc8, -7px -7px 9px #e6dfc8',
    padding: '20px',
    marginTop: '20px',
    transition: 'all 0.1s ease'
};

const AnalysisPanel = ({ centralityMeasures }) => {
    const [selectedMeasure, setSelectedMeasure] = useState('degree');

    const measures = [
        { name: 'Degree Centrality', value: 'degree' },
        { name: 'Betweenness Centrality', value: 'betweenness' },
        { name: 'Closeness Centrality', value: 'closeness' },
    ];

    const chartData = Object.entries(centralityMeasures[selectedMeasure] || {})
        .map(([node, value]) => ({ node, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);

    return (
        <div style={neumorphicStyle}>
            <h3>Network Analyses</h3>
            <div>
                {measures.map(measure => (
                    <button
                        key={measure.value}
                        onClick={() => setSelectedMeasure(measure.value)}
                        style={{
                            ...neumorphicStyle,
                            margin: '5px',
                            cursor: 'pointer',
                            backgroundColor: selectedMeasure === measure.value ? '#e6dfc8' : '#faf7ed'
                        }}
                    >
                        {measure.name}
                    </button>
                ))}
            </div>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                    <XAxis dataKey="node" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default AnalysisPanel;