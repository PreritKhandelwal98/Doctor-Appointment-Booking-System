import {services} from './../assets/data/services'
import Servicecard from '../components/Services/ServiceCard';

const Services = () => {
  return <section>
  <div className="container">
    <div className="grid grid-col-1 md:grid-cols-3 lg:grid-cols-3 gap-5 lg:gap=[30px]">
      {services.map((item,index) => <Servicecard item={item} index={index} key={index}/>)}
    </div>
  </div>
  </section>
}

export default Services