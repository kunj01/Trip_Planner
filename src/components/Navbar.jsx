import { useState, useEffect, useRef } from "react";
import logo from '../img/logo.svg';
import { Link, useHistory } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = ({ sticky, border }) => {
    const [isMenuToggled, setIsMenuToggled] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const { user, isAuthenticated, logout } = useAuth();
    const profileDropdownRef = useRef(null);
    const history = useHistory();

    // Sticky state -> If Sticky prop is received window adds event listener
    useEffect(() => {
        if (!sticky) return;

        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [sticky]);

    // Close profile dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
                setIsProfileDropdownOpen(false);
            }
        };

        if (isProfileDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isProfileDropdownOpen]);

    const handleLogout = () => {
        logout();
        setIsProfileDropdownOpen(false);
        history.push('/');
    };

    return ( 
        // Navbar adds scrolled class to nav element when window's scroll down is greater than 20
        <nav className={`${(scrolled || border) ? 'shadow-lg border-b border-gray-100' : 'shadow-sm'} ${sticky && 'sticky top-0' } relative z-50 transition-all duration-300 bg-white backdrop-blur-sm bg-opacity-95`}>
            {/* element gets a shadow when menu is toggled -> when menu is clicked and on display, the element gets a shadow  */}
            <div className={`container mx-auto w-full flex justify-between items-center px-6 py-4 ${ isMenuToggled && 'shadow-md' }`}>
                {/* Logo */}
                <Link to={"/"} className="flex items-center group">
                    <img src={logo} alt="Traveladvisor" className="w-[180px] sm:w-[200px] md:w-[250px] transition-transform duration-200 group-hover:scale-105"/>
                </Link>
                {/*  */}
                
                <ul className="hidden mmd:flex items-center space-x-2">
                    {/* Link to Hotels Route */}
                    <Link to={"/hotels"}>
                        <li className="group rounded-full hover:bg-blue-50 py-2.5 px-4 cursor-pointer transition-all duration-200 hover:scale-105">
                            <p className="flex font-semibold items-center text-gray-700 group-hover:text-blue-600 transition-colors">
                                <svg viewBox="0 0 24 24" className="w-5 h-5 mr-2 text-gray-500 group-hover:text-blue-600 transition-colors">
                                    <path d="M20.587 12.139V4.144H3.424v7.986A3.805 3.805 0 002 15.097v4.755h1.906v-1.905h16.188v1.91H22v-4.76a3.804 3.804 0 00-1.413-2.958zm-1.906-6.09V8.83a5.048 5.048 0 00-2.865-.876c-1.565 0-2.952.69-3.816 1.749-.864-1.059-2.252-1.749-3.818-1.749-1.07 0-2.056.324-2.851.866V6.049h13.35zm-.258 5.248c-.077-.005-.155-.012-.234-.012h-4.971c.438-.838 1.437-1.426 2.598-1.426 1.168 0 2.173.593 2.607 1.438zm-7.643-.012H5.812c-.081 0-.159.007-.238.012.434-.844 1.438-1.438 2.606-1.438 1.163 0 2.163.588 2.6 1.426zM3.906 16.04v-.943c0-1.051.855-1.905 1.906-1.905h12.376c1.051 0 1.905.854 1.905 1.905v.943H3.906z" fill="currentColor"></path>
                                </svg> 
                                Hotels
                            </p> 
                        </li>
                    </Link>
                    {/* --- */}

                    {/* Link to Restauranst Route */}
                    <Link to={"/restaurants"}>
                        <li className="group rounded-full hover:bg-blue-50 py-2.5 px-4 cursor-pointer transition-all duration-200 hover:scale-105">
                            <p className="flex font-semibold items-center text-gray-700 group-hover:text-blue-600 transition-colors">
                                <svg viewBox="0 0 24 24" className="w-5 h-5 mr-2 text-gray-500 group-hover:text-blue-600 transition-colors">
                                    <path d="M18.753 21.459l-5.502-5.504-2.85 2.851-1.663-1.662-4.315 4.315-1.343-1.344 4.316-4.316-4.004-4.003A4.718 4.718 0 012 8.438c0-1.269.494-2.461 1.392-3.358l.834-.835 7.362 7.362.866-.866c-1.099-1.719-.777-3.972.912-5.661l2.538-2.538 1.343 1.344-2.538 2.537c-.785.787-1.254 1.903-.852 2.916l4.423-4.422 1.343 1.344-4.429 4.428c.31.13.64.188.977.164.646-.043 1.299-.364 1.838-.904a630.937 630.937 0 002.642-2.653L22 8.631s-1.241 1.255-2.647 2.66c-.865.865-1.951 1.383-3.057 1.456a4.027 4.027 0 01-2.501-.66l-.864.862 7.166 7.166-1.344 1.344zM4.291 6.995A2.835 2.835 0 003.9 8.438c0 .762.296 1.478.835 2.015l5.666 5.667 1.506-1.507-7.616-7.618z" fill="currentColor"></path>
                                </svg>
                                Restaurants
                            </p> 
                        </li>
                    </Link>
                    {/* --- */}

                    {/* Link to attractions route */}
                    <Link to={"/attractions"}>
                        <li className="group rounded-full hover:bg-blue-50 py-2.5 px-4 cursor-pointer transition-all duration-200 hover:scale-105" >
                            <p className="flex font-semibold items-center text-gray-700 group-hover:text-blue-600 transition-colors">
                                <svg viewBox="0 0 24 24" className="w-5 h-5 mr-2 text-gray-500 group-hover:text-blue-600 transition-colors">
                                    <circle cx="12" cy="8.5" r="1" fill="currentColor"></circle>
                                    <circle cx="12" cy="12" r="1" fill="currentColor"></circle>
                                    <circle cx="12" cy="15.5" r="1" fill="currentColor"></circle>
                                    <path d="M20 6.5V8c-1.5.7-2.5 2.3-2.5 4 0 1.8 1 3.3 2.5 4v1.5H4V16c1.5-.7 2.5-2.3 2.5-4 0-1.8-1-3.3-2.5-4V6.5h16m2-2H2v5c1.4 0 2.5 1.1 2.5 2.5S3.4 14.5 2 14.5v5h20v-5c-1.4 0-2.5-1.1-2.5-2.5s1.1-2.5 2.5-2.5v-5z" fill="currentColor"></path>
                                </svg>
                            Attractions
                            </p> 
                        </li>
                    </Link>
                    {/* --- */}

                    {/* Link to Itinerary Generator */}
                    <Link to={"/itinerary"}>
                        <li className="rounded-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2.5 px-6 cursor-pointer hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 transform whitespace-nowrap">
                            <p className="flex font-semibold items-center text-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                </svg>
                                Itinerary Generator
                            </p> 
                        </li>
                    </Link>
                    {/* --- */}

                    {/* Link to Map View */}
                    <Link to={"/map"}>
                        <li className="rounded-full bg-gradient-to-r from-gray-900 to-black text-white py-2.5 px-6 cursor-pointer hover:from-gray-800 hover:to-gray-900 transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 transform whitespace-nowrap">
                            <p className="flex font-semibold items-center text-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M12 1.586l-4 4v12.828l4-4V1.586zM3.707 3.293A1 1 0 002 4v10a1 1 0 00.293.707L6 18.414V5.586L3.707 3.293zM17.707 5.293L14 1.586v12.828l2.293 2.293A1 1 0 0018 16V6a1 1 0 00-.293-.707z" clipRule="evenodd" />
                                </svg>
                                Map View
                            </p> 
                        </li>
                    </Link>
                    {/* --- */}

                    {/* Profile Button */}
                    <div className="relative ml-3" ref={profileDropdownRef}>
                        {isAuthenticated && user ? (
                            // Logged in - Profile Dropdown
                            <button
                                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                                className="flex items-center space-x-2 rounded-full bg-gray-800 text-white py-2.5 px-6"
                            >
                                <div className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center">
                                    <svg
                                        className="w-4 h-4 text-gray-300"
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </div>
                                <span className="font-semibold text-sm hidden lg:block text-gray-300">{user.fullName}</span>
                                <svg
                                    className="w-4 h-4 text-gray-300"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </button>
                        ) : (
                            // Not logged in - Login/Signup Button
                            <button
                                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                                className="flex items-center space-x-2 rounded-full border-2 border-gray-300 bg-white text-gray-700 py-2.5 px-6"
                            >
                                <svg
                                    className="w-4 h-4 text-gray-500"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                <span className="text-sm hidden lg:block text-gray-500">Account</span>
                                <svg
                                    className="w-4 h-4 text-gray-500"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </button>
                        )}

                        {/* Dropdown Menu */}
                        {isProfileDropdownOpen && (
                            <div className="absolute right-0 mt-3 w-64 rounded-2xl shadow-2xl bg-white border border-gray-200 py-2 z-50 animate-slide-in backdrop-blur-sm bg-opacity-95">
                                {isAuthenticated && user ? (
                                    // Logged in menu items
                                    <>
                                        <div className="px-5 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
                                            <p className="text-base font-bold text-gray-900">{user.fullName}</p>
                                            <p className="text-xs text-gray-600 mt-1 font-medium">{user.email}</p>
                                        </div>
                                        <Link
                                            to="/profile"
                                            onClick={() => setIsProfileDropdownOpen(false)}
                                            className="flex items-center px-5 py-3.5 text-sm font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 group"
                                        >
                                            <svg
                                                className="w-5 h-5 mr-3 text-gray-400 group-hover:text-blue-600 transition-colors"
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                            My Profile
                                        </Link>
                                        <Link
                                            to="/bookings"
                                            onClick={() => setIsProfileDropdownOpen(false)}
                                            className="flex items-center px-5 py-3.5 text-sm font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 group"
                                        >
                                            <svg
                                                className="w-5 h-5 mr-3 text-gray-400 group-hover:text-blue-600 transition-colors"
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                                <path
                                                    fillRule="evenodd"
                                                    d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                            My Bookings
                                        </Link>
                                        <Link
                                            to="/settings"
                                            onClick={() => setIsProfileDropdownOpen(false)}
                                            className="flex items-center px-5 py-3.5 text-sm font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 group"
                                        >
                                            <svg
                                                className="w-5 h-5 mr-3 text-gray-400 group-hover:text-blue-600 transition-colors"
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                            Settings
                                        </Link>
                                        <div className="border-t border-gray-200 my-2"></div>
                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center w-full px-5 py-3.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition-all duration-200 rounded-b-2xl group"
                                        >
                                            <svg
                                                className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform"
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                            Logout
                                        </button>
                                    </>
                                ) : (
                                    // Not logged in menu items
                                    <>
                                        <Link
                                            to="/login"
                                            onClick={() => setIsProfileDropdownOpen(false)}
                                            className="flex items-center px-5 py-4 text-base font-bold text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 rounded-t-2xl group"
                                        >
                                            <svg
                                                className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform"
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                            Sign In
                                        </Link>
                                        <Link
                                            to="/signup"
                                            onClick={() => setIsProfileDropdownOpen(false)}
                                            className="flex items-center px-5 py-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all duration-200 border-t border-gray-200 rounded-b-2xl group"
                                        >
                                            <svg
                                                className="w-5 h-5 mr-3 text-gray-500 group-hover:text-gray-700 transition-colors"
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                                            </svg>
                                            Create Account
                                        </Link>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                    {/* --- */}
                </ul>

                {/* Menu Toggle Button -> Opens Menu if close and closes menu if Opened */}
                <div 
                    className="mmd:hidden rounded-full hover:bg-blue-50 p-2.5 cursor-pointer transition-all duration-200" 
                    onClick={() => isMenuToggled ? setIsMenuToggled(false) : setIsMenuToggled(true) }
                >
                    { !isMenuToggled ? (
                        // Display is Menu Open Icon - Menu is Closed
                        <svg className="h-6 w-6 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h16M4 16h16" />
                        </svg>
                    ) : (
                        // Display a Menu Close Icon
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    ) }
                </div>
                {/* --- */}
            </div>
            {/* --- */}

            {/* Menu For Only Mobile */}
            {isMenuToggled && (
                <div className="flex flex-col mmd:hidden bg-white shadow-xl border-t border-gray-100 absolute w-full top-full animate-slide-in">
                    {/* Link to hotel Route */}
                    <Link to={"/hotels"} onClick={() => setIsMenuToggled(false)}>
                        <p className="flex font-semibold items-center cursor-pointer px-6 py-3.5 hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition-colors">
                            <svg viewBox="0 0 24 24" className="w-5 h-5 mr-3 text-gray-500">
                                <path d="M20.587 12.139V4.144H3.424v7.986A3.805 3.805 0 002 15.097v4.755h1.906v-1.905h16.188v1.91H22v-4.76a3.804 3.804 0 00-1.413-2.958zm-1.906-6.09V8.83a5.048 5.048 0 00-2.865-.876c-1.565 0-2.952.69-3.816 1.749-.864-1.059-2.252-1.749-3.818-1.749-1.07 0-2.056.324-2.851.866V6.049h13.35zm-.258 5.248c-.077-.005-.155-.012-.234-.012h-4.971c.438-.838 1.437-1.426 2.598-1.426 1.168 0 2.173.593 2.607 1.438zm-7.643-.012H5.812c-.081 0-.159.007-.238.012.434-.844 1.438-1.438 2.606-1.438 1.163 0 2.163.588 2.6 1.426zM3.906 16.04v-.943c0-1.051.855-1.905 1.906-1.905h12.376c1.051 0 1.905.854 1.905 1.905v.943H3.906z" fill="currentColor"></path>
                            </svg> 
                            Hotels
                        </p> 
                    </Link>
                    {/* --- */}

                    {/* Link to Restaurants Route */}
                    <Link to={"/restaurants"} onClick={() => setIsMenuToggled(false)}>
                        <p className="flex font-semibold items-center cursor-pointer px-6 py-3.5 hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition-colors">
                            <svg viewBox="0 0 24 24" className="w-5 h-5 mr-3 text-gray-500">
                                <path d="M18.753 21.459l-5.502-5.504-2.85 2.851-1.663-1.662-4.315 4.315-1.343-1.344 4.316-4.316-4.004-4.003A4.718 4.718 0 012 8.438c0-1.269.494-2.461 1.392-3.358l.834-.835 7.362 7.362.866-.866c-1.099-1.719-.777-3.972.912-5.661l2.538-2.538 1.343 1.344-2.538 2.537c-.785.787-1.254 1.903-.852 2.916l4.423-4.422 1.343 1.344-4.429 4.428c.31.13.64.188.977.164.646-.043 1.299-.364 1.838-.904a630.937 630.937 0 002.642-2.653L22 8.631s-1.241 1.255-2.647 2.66c-.865.865-1.951 1.383-3.057 1.456a4.027 4.027 0 01-2.501-.66l-.864.862 7.166 7.166-1.344 1.344zM4.291 6.995A2.835 2.835 0 003.9 8.438c0 .762.296 1.478.835 2.015l5.666 5.667 1.506-1.507-7.616-7.618z" fill="currentColor"></path>
                            </svg>
                            Restaurants
                        </p>
                    </Link>
                    {/* --- */}

                    {/* Link to attractions Route */}
                    <Link to={"/attractions"} onClick={() => setIsMenuToggled(false)}>
                        <p className="flex font-semibold items-center cursor-pointer px-6 py-3.5 hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition-colors">
                            <svg viewBox="0 0 24 24" className="w-5 h-5 mr-3 text-gray-500">
                                <circle cx="12" cy="8.5" r="1" fill="currentColor"></circle>
                                <circle cx="12" cy="12" r="1" fill="currentColor"></circle>
                                <circle cx="12" cy="15.5" r="1" fill="currentColor"></circle>
                                <path d="M20 6.5V8c-1.5.7-2.5 2.3-2.5 4 0 1.8 1 3.3 2.5 4v1.5H4V16c1.5-.7 2.5-2.3 2.5-4 0-1.8-1-3.3-2.5-4V6.5h16m2-2H2v5c1.4 0 2.5 1.1 2.5 2.5S3.4 14.5 2 14.5v5h20v-5c-1.4 0-2.5-1.1-2.5-2.5s1.1-2.5 2.5-2.5v-5z" fill="currentColor"></path>
                            </svg>
                            Attractions
                        </p>
                    </Link>
                    {/* --- */}

                    {/* Link to Itinerary Generator */}
                    <Link to={"/itinerary"} onClick={() => setIsMenuToggled(false)}>
                        <p className="flex font-semibold items-center cursor-pointer px-6 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 transition-colors text-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-3" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                            </svg>
                            Itinerary Generator
                        </p> 
                    </Link>
                    {/* --- */}

                    {/* Lint to Mapview Route */}
                    <Link to={"/map"} onClick={() => setIsMenuToggled(false)}>
                        <p className="flex font-semibold items-center cursor-pointer px-6 py-3.5 bg-gradient-to-r from-gray-900 to-black text-white hover:from-gray-800 hover:to-gray-900 transition-colors text-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-3" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M12 1.586l-4 4v12.828l4-4V1.586zM3.707 3.293A1 1 0 002 4v10a1 1 0 00.293.707L6 18.414V5.586L3.707 3.293zM17.707 5.293L14 1.586v12.828l2.293 2.293A1 1 0 0018 16V6a1 1 0 00-.293-.707z" clipRule="evenodd" />
                            </svg>
                            Switch to Map View
                        </p> 
                    </Link>
                    {/* --- */}

                    {/* Profile Button - Mobile */}
                    <div className="border-t-2 border-gray-100 pt-3 mt-2 bg-gray-50">
                        {isAuthenticated && user ? (
                            <div className="px-6 py-3">
                                <p className="text-base font-bold text-gray-900 mb-3">{user.fullName}</p>
                                <Link
                                    to="/profile"
                                    onClick={() => setIsMenuToggled(false)}
                                    className="flex items-center text-sm font-semibold text-gray-700 hover:text-blue-600 mb-3 transition-colors"
                                >
                                    <svg className="w-5 h-5 mr-3 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                    </svg>
                                    My Profile
                                </Link>
                                <button
                                    onClick={() => {
                                        handleLogout();
                                        setIsMenuToggled(false);
                                    }}
                                    className="flex items-center text-sm font-semibold text-red-600 hover:text-red-700 transition-colors"
                                >
                                    <svg className="w-5 h-5 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    onClick={() => setIsMenuToggled(false)}
                                    className="flex items-center font-bold text-blue-600 hover:bg-blue-50 px-6 py-3.5 transition-colors"
                                >
                                    <svg className="w-5 h-5 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    Sign In
                                </Link>
                                <Link
                                    to="/signup"
                                    onClick={() => setIsMenuToggled(false)}
                                    className="flex items-center font-semibold text-gray-700 hover:bg-gray-100 px-6 py-3.5 border-t border-gray-200 transition-colors"
                                >
                                    <svg className="w-5 h-5 mr-3 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                                    </svg>
                                    Create Account
                                </Link>
                            </>
                        )}
                    </div>
                    {/* --- */}
                </div>
            )}
            {/* --- */}
        </nav>
     );
}
 
export default Navbar;