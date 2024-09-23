import { useEffect, useState } from "react";
import { token } from '../utils/config';
import { toast } from 'react-toastify';

const useFetchData = (url) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(url, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!res.ok) {
          const errorText = await res.text(); // Get response text for non-JSON errors
          toast.error('Error fetching data: ' + errorText);
          setError('Error fetching data: ' + errorText);
          return;
        }

        const result = await res.json();
        setData(result);
      } catch (err) {
        console.error(err);
        toast.error('An error occurred while fetching data');
        setError('An error occurred while fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  return { data, loading, error };
};

export default useFetchData;
