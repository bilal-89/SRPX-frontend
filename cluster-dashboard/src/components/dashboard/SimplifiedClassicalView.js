
import React, { useEffect, useRef, useState } from 'react';

const SimplifiedClassicalView = ({ data }) => {
    const canvasRef = useRef(null);
    const [animationProgress, setAnimationProgress] = useState(0);

    // Define fixed activity types and their properties
    const fixedActivities = [
        { type: 'Study Circle', color: 'rgb(130, 168, 2,0.6)', label: 'SC' },
        { type: 'Devotional', color: 'rgb(184, 2, 75,0.6)', label: 'DEV' },
        { type: 'Home Visit', color: 'rgb(245, 45, 5,0.6)', label: 'HV' },
        { type: "Children's Class", color: 'rgb(242, 110, 2,0.6)', label: "CC" },
        { type: 'JYG', color: 'rgb(109, 5, 245,0.5)', label: 'JYG' },
        { type: 'Nucleus', color: 'rgba(152,54,18,0.9)', label: 'NUC' }
    ];

    // Custom function to draw rounded rectangles
    const drawRoundedRect = (ctx, x, y, width, height, radius) => {
        if (height > 0) {  // Only draw if height is greater than 0
            ctx.beginPath();
            ctx.moveTo(x + radius, y);
            ctx.lineTo(x + width - radius, y);
            ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
            ctx.lineTo(x + width, y + height - radius);
            ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
            ctx.lineTo(x + radius, y + height);
            ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
            ctx.lineTo(x, y + radius);
            ctx.quadraticCurveTo(x, y, x + radius, y);
            ctx.closePath();
            ctx.fill();
        }
    };

    useEffect(() => {
        let animationFrame;
        const animate = () => {
            setAnimationProgress(prev => {
                if (prev < 1) {
                    animationFrame = requestAnimationFrame(animate);
                    return prev + 0.05; // Adjust this value to change animation speed
                }
                return 1;
            });
        };
        setAnimationProgress(0);
        animate();

        return () => cancelAnimationFrame(animationFrame);
    }, [data]);

    useEffect(() => {
        if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            const width = canvasRef.current.width;
            const height = canvasRef.current.height;

            ctx.clearRect(0, 0, width, height);

            const activityCounts = data.reduce((acc, item) => {
                acc[item.ActivityType] = (acc[item.ActivityType] || 0) + 1;
                return acc;
            }, {});

            const barCount = fixedActivities.length;
            const maxCount = Math.max(...Object.values(activityCounts), 1);

            const totalBarSpace = width-190;
            const barWidth = 54;
            const spacing = (totalBarSpace - barWidth * barCount) / (barCount);

            fixedActivities.forEach((activity, index) => {
                const count = activityCounts[activity.type] || 0;
                const fullBarHeight = count > 0 ? (count / maxCount) * (height - 60) : 0;
                const barHeight = Math.max(0, fullBarHeight * animationProgress);  // Ensure non-negative height
                const x = 19 + index * (barWidth + spacing);
                const y = height - barHeight - 40;

                // Draw rounded bar only if there's a count
                if (count > 0) {
                    ctx.fillStyle = activity.color;
                    drawRoundedRect(ctx, x, y, barWidth, barHeight, 5); // 5 is the corner radius

                    // Draw count if bar is visible
                    // if (barHeight > 1) {  // Only draw text if bar is tall enough
                    //     ctx.fillStyle = '#000';
                    //     ctx.font = '10px Arial';
                    //     ctx.textAlign = 'center';
                    //     ctx.fillText(Math.round(count * animationProgress), x + barWidth / 2, y - 5);
                    // }
                }

                // Always draw the label
                ctx.fillStyle = '#000';
                ctx.font = '14px Maname';
                ctx.textAlign = 'center';
                ctx.fillText(activity.label, x + barWidth / 2, height - 5);
            });
        }
    }, [data, animationProgress]);

    return <canvas ref={canvasRef} width={700} height={260}></canvas>;
};

export default SimplifiedClassicalView;