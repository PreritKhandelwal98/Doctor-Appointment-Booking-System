import Home from '../pages/Home'
import Services from '../pages/Services'
import Contact from '../pages/Contact'
import Signup from '../pages/Signup'
import Login from '../pages/Login'
import Doctors from '../pages/Doctors/Doctors'
import DoctorDetails from '../pages/Doctors//DoctorDetails'
import MyAccount from '../dashboard/user-account/MyAccount'
import Dashboard from '../dashboard/doctor-account/Dashboard'
import AdminDashboard from '../dashboard/admin-account/Dashboard'
import CheckoutSuccess from '../pages/Doctors/CheckoutSuccess'
import VirtualMeeting from '../dashboard/doctor-account/VirtualMeeting'
import {Routes,Route} from 'react-router-dom'

import ProtectedRoutes from './ProtectedRoutes'

function Routers() {
  return (
    <Routes>
      <Route path="/" element={<Home/>}/>
      <Route path="/home" element={<Home/>}/>
      <Route path="/doctors" element={<Doctors/>}/>
      <Route path="/doctors/:id" element={<DoctorDetails/>}/>
      <Route path="/login" element={<Login/>}/>
      <Route path="/register" element={<Signup/>}/>
      <Route path="/contact" element={<Contact/>}/>
      <Route path="/services" element={<Services/>}/>
      <Route path="/users/profile/me" element={<ProtectedRoutes allowedRoles={['patient']}><MyAccount/></ProtectedRoutes>}/>
      <Route path="/doctors/profile/me" element={<ProtectedRoutes allowedRoles={['doctor']}><Dashboard/></ProtectedRoutes>}/>
      <Route path="/admin/dashboard" element={<ProtectedRoutes allowedRoles={['admin']}><AdminDashboard/></ProtectedRoutes>}/>

      <Route path="/appointments/virtual/" element={<VirtualMeeting />} />

      <Route path="/checkout-success" element={<CheckoutSuccess/>}/>


    </Routes>
  )
}

export default Routers