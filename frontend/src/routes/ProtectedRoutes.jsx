/* eslint-disable react/prop-types */
import {useContext} from 'react'
import {Navigate} from 'react-router-dom'
import {authContext} from '../context/authContext'

const ProtectedRoutes = ({children,allowedRoles}) => {
    const {token,role} = useContext(authContext)

    const isAllowed = allowedRoles.includes(role)

    const accessableRoute = token && isAllowed ? children : <Navigate to='/login' replace={true} />
  return accessableRoute
}

export default ProtectedRoutes