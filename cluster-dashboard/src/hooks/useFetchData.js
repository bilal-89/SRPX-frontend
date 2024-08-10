// useFetchData.js
import { useState, useEffect, useCallback } from 'react';

const useFetchData = (url, initialParams) => {
    const [data, setData] = useState([]);  // Initialize as empty array
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [params, setParams] = useState(initialParams);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const queryString = new URLSearchParams(params).toString();
            const response = await fetch(`${url}?${queryString}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            setData(result);
            setError(null);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, [url, params]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const refetch = useCallback((newParams) => {
        setParams(prevParams => ({ ...prevParams, ...newParams }));
    }, []);

    return { data, loading, error, refetch };
};

export default useFetchData;