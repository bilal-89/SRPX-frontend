import React, { useState } from 'react';

const neumorphicButtonStyle = {
    backgroundColor: '#faf7ed',
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

const pressedStyle = {
    boxShadow: 'inset 3px 3px 6px #e6e3da, inset -3px -3px 6px #ffffff',
    transform: 'translateY(2px)'
};

const StandardAnalysesPanel = ({ onAnalysisChange, data }) => {
    const [activeAnalysis, setActiveAnalysis] = useState(null);

    const handleAnalysisChange = (analysis) => {
        setActiveAnalysis(analysis);
        onAnalysisChange(analysis);
    };

    const calculateCAGR = (startValue, endValue, numYears) => {
        return ((endValue / startValue) ** (1 / numYears) - 1) * 100;
    };

    const renderGrowthRates = () => {
        if (!data || data.length === 0) return null;

        const numYears = (new Date(data[data.length - 1].Date) - new Date(data[0].Date)) / (1000 * 60 * 60 * 24 * 365);

        return (
            <div>
                <h4>Compound Annual Growth Rates (CAGR)</h4>
                <p>JYG: {calculateCAGR(data[0].JYG.cumulative, data[data.length - 1].JYG.cumulative, numYears).toFixed(2)}%</p>
                <p>Study Circle: {calculateCAGR(data[0].StudyCircle.cumulative, data[data.length - 1].StudyCircle.cumulative, numYears).toFixed(2)}%</p>
                <p>Children's Class: {calculateCAGR(data[0].ChildrensClass.cumulative, data[data.length - 1].ChildrensClass.cumulative, numYears).toFixed(2)}%</p>
            </div>
        );
    };

    const identifyPhases = () => {
        // This is a simplified placeholder logic. You'll need to implement more sophisticated
        // logic based on your specific criteria for expansion and consolidation.
        const phases = [];
        let isExpanding = true;
        let phaseStart = data[0].Date;

        for (let i = 1; i < data.length; i++) {
            const prevTotal = data[i-1].JYG.daily + data[i-1].StudyCircle.daily + data[i-1].ChildrensClass.daily;
            const currentTotal = data[i].JYG.daily + data[i].StudyCircle.daily + data[i].ChildrensClass.daily;

            if ((isExpanding && currentTotal < prevTotal) || (!isExpanding && currentTotal > prevTotal)) {
                phases.push({
                    type: isExpanding ? 'Expansion' : 'Consolidation',
                    start: phaseStart,
                    end: data[i-1].Date
                });
                isExpanding = !isExpanding;
                phaseStart = data[i].Date;
            }
        }

        phases.push({
            type: isExpanding ? 'Expansion' : 'Consolidation',
            start: phaseStart,
            end: data[data.length - 1].Date
        });

        return phases;
    };

    const renderPhases = () => {
        const phases = identifyPhases();
        return (
            <div>
                <h4>Expansion and Consolidation Phases</h4>
                {phases.map((phase, index) => (
                    <p key={index}>{phase.type}: {phase.start} to {phase.end}</p>
                ))}
            </div>
        );
    };

    return (
        <div>
            <h3>Standard Analyses</h3>
            {['growth', 'phases'].map((analysis) => (
                <button
                    key={analysis}
                    style={{
                        ...neumorphicButtonStyle,
                        ...(activeAnalysis === analysis ? pressedStyle : {})
                    }}
                    onClick={() => handleAnalysisChange(analysis)}
                >
                    {analysis === 'growth' ? 'Growth Rates' : 'Expansion/Consolidation Phases'}
                </button>
            ))}
            <div style={{ marginTop: '20px' }}>
                {activeAnalysis === 'growth' && renderGrowthRates()}
                {activeAnalysis === 'phases' && renderPhases()}
            </div>
        </div>
    );
};

export default StandardAnalysesPanel;