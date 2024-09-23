import {BiMenu} from 'react-icons/bi'
import { authContext } from '../../context/authContext';
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';

const Tab = ({tab,setTab}) => {
    const {dispatch} = useContext(authContext)
    const navigate = useNavigate()
    const handleLogout = () =>{
        dispatch({type:"LOGOUT"})
        navigate("/")
    }
  return (
    <div>
        <span className="lg:hidden">
            <BiMenu className="w-6 h-6 cursor-pointer"/>
        </span>
        <div className="hidden lg:flex flex-col p-[30px] bg-white shadow-panelShadow items-center h-max rounded-md">
            <button onClick={()=>setTab('approval_request')} className={`${tab=== 'approval_request' ? 'bg-indigo-100 text-primaryColor':'bg-transparent text-headingColor'} w-full btn mt-0 rounded-md`}>Approval Request</button>
            {/* <button onClick={()=>setTab('overview')} className={`${tab=== 'overview' ? 'bg-indigo-100 text-primaryColor':'bg-transparent text-headingColor'} w-full btn mt-0 rounded-md`}>Overview</button> */}
            <button onClick={()=>setTab('settings')} className={`${tab=== 'settings' ? 'bg-indigo-100 text-primaryColor':'bg-transparent text-headingColor'} w-full btn mt-0 rounded-md`}>Admin Profile</button>
            <div className="mt-[100px] w-full">
                <button className="w-full bg-[#181A1E] p-3 text-[16px] leading-7 rounded-md text-[#fff]" onClick={handleLogout}>Logout</button>
                <button className="w-full bg-red-600 mt-4 p-3 text-[16px] leading-7 rounded-md text-[#fff]">Delete Account</button>
        
            </div>
        </div>
    </div>
  )
}

export default Tab