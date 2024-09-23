import { useContext, useEffect, useRef } from 'react';
import logo from '../../assets/images/logo.png';
import { NavLink, Link } from 'react-router-dom';
import { BiMenu } from 'react-icons/bi';
import { authContext } from '../../context/authContext';

const navLinks = [
  {
    path: '/home',
    display: 'Home',
  },
  {
    path: '/doctors',
    display: 'Find a Doctor',
  },
  {
    path: '/services',
    display: 'Services',
  },
  {
    path: '/contact',
    display: 'Contact',
  },
];

const Header = () => {
  const { user, token, role } = useContext(authContext);

  const headerRef = useRef(null);
  const menuRef = useRef(null);

  const handleStickyHeader = () => {
    window.addEventListener('scroll', () => {
      if (document.body.scrollTop > 80 || document.documentElement.scrollTop > 80) {
        headerRef.current.classList.add('sticky__header');
      } else {
        headerRef.current.classList.remove('sticky__header');
      }
    });
  };

  useEffect(() => {
    handleStickyHeader();

    return () => window.removeEventListener('scroll', handleStickyHeader);
  }, []);

  const toggleMenu = () => menuRef.current.classList.toggle('show_menu');

  return (
    <header className="container" ref={headerRef}>
      <div className="container">
        <div className="flex items-center justify-between">
          {/** ===========  Logo  ========== */}
          <div>
            <Link to="/home">
              <img src={logo} alt="" />
            </Link>
          </div>

          {/** ===========  menu  ========== */}
          <div className="navigation" ref={menuRef} onClick={toggleMenu}>
            <ul className="menu flex items-center gap-[2.7rem]">
              {navLinks.map((link, index) => (
                <li key={index}>
                  <NavLink
                    to={link.path}
                    className={(navClass) =>
                      navClass.isActive
                        ? 'text-primaryColor text-[16px] leading-7 font-[600]'
                        : 'text-textColor text-[16px] leading-7 font-[500] hover:text-primaryColor'
                    }
                  >
                    {link.display}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/** =========== nav right ========== */}
          <div className="flex items-center gap-4">
            {token && user ? (
              <div>
                {/* Dynamically set the profile link based on the user's role */}
                <Link
                  to={
                    role === 'doctor'
                      ? '/doctors/profile/me'
                      : role === 'admin'
                      ? '/admin/dashboard'
                      : '/users/profile/me'
                  }
                >
                  <figure className="w-[35px] h-[35px] rounded-full cursor-pointer">
                    {user?.photo ? (
                      <img
                        src={user?.photo}
                        className="w-full rounded-full"
                        alt="User profile"
                      />
                    ) : (
                      <span className="flex items-center justify-center text-center w-full h-full">
                        {user?.name}
                      </span>
                    )}
                  </figure>
                </Link>
              </div>
            ) : (
              <Link to="/login">
                <button className="bg-primaryColor py-2 px-6 text-white font-[600] h-[44px] flex items-center justify-center rounded-[50px]">
                  Login
                </button>
              </Link>
            )}

            <span className="md:hidden" onClick={toggleMenu}>
              <BiMenu className="w-6 h-6 cursor-pointer" />
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
