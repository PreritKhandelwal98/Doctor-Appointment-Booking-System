import { useEffect, useState } from "react";
import { toast } from 'react-toastify';

const useFetchData = (url) => {
  const [data, setData] = useState(null); // Initialize as null to handle no data scenario
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token'); // Get the token from localStorage

        if (!token) {
          // No token found, set a user-friendly error and stop further execution
          setError("No authentication token found. Please log in.");
          setLoading(false);
          return;
        }

        const res = await fetch(url, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`, // Use token in the request
          },
        });

        if (!res.ok) {
          const errorText = await res.text();
          
          // Only show the toast for actual errors, not empty data
          if (res.status !== 404) { // Treat 404 as "No data found" not an error
            toast.error('Error fetching data: ' + errorText);
          }

          setError('Error fetching data: ' + errorText);
          setData(null); // Clear the data in case of error
        } else {
          const result = await res.json();
          setData(result); // Set the fetched data
        }
      } catch (err) {
        console.error(err);
        toast.error('An error occurred while fetching data: ' + err.message);
        setError('An error occurred while fetching data: ' + err.message);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  return { data, loading, error };
};

export default useFetchData;
