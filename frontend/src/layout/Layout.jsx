import Header from '../components/Header/Header'
import Footer from '../components/Footer/Footer'
import Routers from '../routes/Routers'
import FloatingChatIcon from './../components/Float Icon/FloatingChatIcon'


function Layout() {
  return (
    <>
        <Header/>
        <main>
            <Routers/>
        </main>
        <FloatingChatIcon/>
        <Footer/>
    </>
  )
}

export default Layout