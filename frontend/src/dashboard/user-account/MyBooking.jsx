import useFetchData from "../../hooks/userFetchData";
import { BASE_URL } from "../../utils/config";
import DoctorCard from './../../components/Doctors/DoctorCard';
import Loading from "../../components/Loader/Loading";
import Error from "../../components/Error/Error";

const MyBooking = () => {
  const { data: response, loading, error } = useFetchData(`${BASE_URL}/user/appointments/my-appointments`);

  // Ensure the data is in the expected format
  const doctors = response?.data || [];

  return (
    <div className="mt-10">
      {loading && !error && <Loading />}
      {error && !loading && <Error errorMessage={error} />}
      {!loading && !error && Array.isArray(doctors) && doctors.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {doctors.map(doctor => (
            <DoctorCard doctor={doctor} key={doctor._id} />
          ))}
        </div>
      )}
      {!loading && !error && (!doctors || !Array.isArray(doctors) || doctors.length === 0) && (
        <h2 className="mt-5 text-center leading-7 text-[20px] font-semibold text-primaryColor">
          You did not book any doctor yet!
        </h2>
      )}
    </div>
  );
}

export default MyBooking;
