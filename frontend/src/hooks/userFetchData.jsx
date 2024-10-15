import { useEffect, useState } from "react";
import { toast } from 'react-toastify';

const useFetchData = (url, requiresAuth = true) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let headers = {};

        // Conditionally check and add the Authorization header if authentication is required
        if (requiresAuth) {
          const token = localStorage.getItem('token');
          if (token) {
            headers.Authorization = `Bearer ${token}`;
          } else {
            // If no token is found but authentication is required, throw an error
            setError("No authentication token found. Please log in.");
            console.log("inside else");
            
            setLoading(false);
            return;
          }
        }

        // Perform the fetch request with or without headers depending on the condition
        const res = await fetch(url, { method: 'GET', headers });
        
        if (!res.ok) {
          const errorText = await res.text();
          if (res.status !== 404) {
            toast.error('Error fetching data: ' + errorText);
          }
          setError('Error fetching data: ' + errorText);
          setData(null);
        } else {
          const result = await res.json();
          setData(result);
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
  }, [url, requiresAuth]);

  return { data, loading, error };
};

export default useFetchData;
