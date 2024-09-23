import DoctorCard from './DoctorCard';

import { BASE_URL } from './../../utils/config';
import ERROR from './../Error/Error';
import Loader from './../Loader/Loading';
import useFetchData from './../../hooks/userFetchData';

const DoctorList = () => {
  const { data, loading, error } = useFetchData(`${BASE_URL}/doctors`);
  

  return (
    <>
      {loading && <Loader />}
      {error && !loading && <ERROR />}
      {data && !loading && !error && Array.isArray(data.data) &&
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 lg:gap-[30px] mt-[30px] lg:mt-[55px]">
          {data.data.map((doctor) => (
            <DoctorCard key={doctor._id} doctor={doctor} />
          ))}
        </div>
      }
    </>
  );
};

export default DoctorList;
