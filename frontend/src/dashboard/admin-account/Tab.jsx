import { BiMenu } from 'react-icons/bi';
import { authContext } from '../../context/authContext';
import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Tab = ({ tab, setTab }) => {
    const { dispatch } = useContext(authContext);
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // To toggle mobile menu

    const handleLogout = () => {
        dispatch({ type: "LOGOUT" });
        navigate("/");
    };

    // Toggle mobile menu function
    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <div>
            {/* Mobile Menu - Visible only on small screens */}
            <div className="lg:hidden">
                <BiMenu className="w-6 h-6 cursor-pointer" onClick={toggleMobileMenu} />
                {isMobileMenuOpen && (
                    <div className="absolute bg-white shadow-panelShadow p-5 rounded-md w-full left-0 top-14 z-50">
                        <button
                            onClick={() => {
                                setTab('approval_request');
                                setIsMobileMenuOpen(false); // Close menu on click
                            }}
                            className={`${tab === 'approval_request' ? 'bg-indigo-100 text-primaryColor' : 'bg-transparent text-headingColor'} w-full btn mt-0 rounded-md`}
                        >
                            Approval Request
                        </button>
                        <button
                            onClick={() => {
                                setTab('payment');
                                setIsMobileMenuOpen(false);
                            }}
                            className={`${tab === 'payment' ? 'bg-indigo-100 text-primaryColor' : 'bg-transparent text-headingColor'} w-full btn mt-0 rounded-md`}
                        >
                            Payment Status
                        </button>
                        <button
                            onClick={() => {
                                setTab('settings');
                                setIsMobileMenuOpen(false);
                            }}
                            className={`${tab === 'settings' ? 'bg-indigo-100 text-primaryColor' : 'bg-transparent text-headingColor'} w-full btn mt-0 rounded-md`}
                        >
                            Admin Profile
                        </button>
                        <div className="mt-8 w-full">
                            <button
                                className="w-full bg-[#181A1E] p-3 text-[16px] leading-7 rounded-md text-[#fff]"
                                onClick={() => {
                                    handleLogout();
                                    setIsMobileMenuOpen(false);
                                }}
                            >
                                Logout
                            </button>
                            <button
                                className="w-full bg-red-600 mt-4 p-3 text-[16px] leading-7 rounded-md text-[#fff]"
                            >
                                Delete Account
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Desktop Menu - Visible only on large screens */}
            <div className="hidden lg:flex flex-col p-[30px] bg-white shadow-panelShadow items-center h-max rounded-md">
                <button
                    onClick={() => setTab('approval_request')}
                    className={`${tab === 'approval_request' ? 'bg-indigo-100 text-primaryColor' : 'bg-transparent text-headingColor'} w-full btn mt-0 rounded-md`}
                >
                    Approval Request
                </button>
                <button
                    onClick={() => setTab('payment')}
                    className={`${tab === 'payment' ? 'bg-indigo-100 text-primaryColor' : 'bg-transparent text-headingColor'} w-full btn mt-0 rounded-md`}
                >
                    Payment Status
                </button>
                <button
                    onClick={() => setTab('settings')}
                    className={`${tab === 'settings' ? 'bg-indigo-100 text-primaryColor' : 'bg-transparent text-headingColor'} w-full btn mt-0 rounded-md`}
                >
                    Admin Profile
                </button>
                <div className="mt-[100px] w-full">
                    <button
                        className="w-full bg-[#181A1E] p-3 text-[16px] leading-7 rounded-md text-[#fff]"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>
                    <button
                        className="w-full bg-red-600 mt-4 p-3 text-[16px] leading-7 rounded-md text-[#fff]"
                    >
                        Delete Account
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Tab;
