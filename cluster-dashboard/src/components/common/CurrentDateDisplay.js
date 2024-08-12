import React from 'react';
import { useQuery } from '../../context/QueryContext';

const CurrentDateDisplay = () => {
    const { currentTimestep } = useQuery();

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';

        let date;
        if (dateString.includes('GMT')) {
            // Handle GMT date string
            date = new Date(dateString);
        } else {
            // Handle YYYY-MM-DD format
            const [year, month, day] = dateString.split('-').map(Number);
            date = new Date(Date.UTC(year, month - 1, day));
        }

        if (isNaN(date.getTime())) {
            console.error('Invalid date:', dateString);
            return dateString; // Return original string if parsing fails
        }

        const monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"];
        const month = monthNames[date.getUTCMonth()];
        const day = date.getUTCDate();
        const year = date.getUTCFullYear();

        return `${day} ${month} ${year}`;
    };

    console.log('Current timestep:', currentTimestep);
    const formattedDate = formatDate(currentTimestep);
    console.log('Formatted date:', formattedDate);

    return (
        <div style={{
            fontSize: '1.1em',
            fontWeight: 'bold',
            color: '#5a5a4f',
            textAlign: 'center',
            padding: '0px',
            marginTop: '00px',
            fontFamily: 'Maname'
        }}>
            {formattedDate}
        </div>
    );
};

export default CurrentDateDisplay;