import {services} from '../../assets/data/services';
import Servicecard from './ServiceCard';
const ServiceList = ()=> {
  return (
    <div className="grid grid-col-1 md:grid-cols-3 lg:grid-cols-3 gap-5 lg:gap=[30px] mt-[30px] lg:mt-[55px]">
      {services.map((item,index) => <Servicecard item={item} index={index} key={index}/>)}
    </div>
  )
}

export default ServiceList