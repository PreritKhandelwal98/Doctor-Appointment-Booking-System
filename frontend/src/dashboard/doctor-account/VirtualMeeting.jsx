import { useParams } from "react-router-dom";


const VirtualMeeting = () => {
  
    const {id} = useParams()

  return (
    <div>
      <h1>virtual meeting component : {id}</h1>
    </div>
  );
};

export default VirtualMeeting;
