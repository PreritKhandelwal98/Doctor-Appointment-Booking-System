import Home from '../pages/Home'
import Services from '../pages/Services'
import Contact from '../pages/Contact'
import Signup from '../pages/Signup'
import Login from '../pages/Login'
import Doctors from '../pages/Doctors/Doctors'
import PageNotFound from '../pages/PageNotFound'
import DoctorDetails from '../pages/Doctors//DoctorDetails'
import MyAccount from '../dashboard/user-account/MyAccount'
import Dashboard from '../dashboard/doctor-account/Dashboard'
import AdminDashboard from '../dashboard/admin-account/Dashboard'
import CheckoutSuccess from '../pages/Doctors/CheckoutSuccess'
import VirtualMeeting from '../dashboard/doctor-account/VirtualAppointments/VirtualMeeting'
import {Routes,Route} from 'react-router-dom'
import PatientVirtualAppoinment from '../dashboard/user-account/PatientVirtualAppoinment'
import PrescriptionView from '../dashboard/doctor-account/Prescriptions/PrescriptionView '
import ProtectedRoutes from './ProtectedRoutes'
import ForgotPassword from '../pages/ForgotPassword'

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
      <Route path="/forgot-password" element={<ForgotPassword/>}/>

      <Route path="/users/profile/me" element={<ProtectedRoutes allowedRoles={['patient']}><MyAccount/></ProtectedRoutes>}/>
      <Route path="/doctors/profile/me" element={<ProtectedRoutes allowedRoles={['doctor']}><Dashboard/></ProtectedRoutes>}/>
      <Route path="/admin/dashboard" element={<ProtectedRoutes allowedRoles={['admin']}><AdminDashboard/></ProtectedRoutes>}/>
      <Route path="/prescription/:id" element={<ProtectedRoutes allowedRoles={['admin']}><AdminDashboard/></ProtectedRoutes>}/>

      <Route path="/appointments/virtual/:id" element={<VirtualMeeting />} />
      <Route path="/appointment/virtualappoinments" element={<PatientVirtualAppoinment />} />

      <Route path="/checkout-success" element={<CheckoutSuccess/>}/>
      <Route path="/*" element={<PageNotFound/>}/>


    </Routes>
  )
}

export default Routers