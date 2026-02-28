import { Link } from "react-router-dom";
import { IoHome, IoLogOut, IoSearch } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import getGreeting from "../utils/greeting";
import { FcGoogle } from "react-icons/fc";
import { useState } from "react";
import toast from "react-hot-toast";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import Search from "./Search";

export default function Navbar() {

    const dispatch = useDispatch();
    const user = useSelector((state) => state.userReducer);

    const [loading, setLoading] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    const handleToggleUnit = (e) => {
        dispatch({ type: 'SET_TEMP_UNIT', payload: e.target.checked ? 'F' : 'C' })
    }

    const handleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                setLoading(true);
                const response = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: {
                        Authorization: `Bearer ${tokenResponse.access_token}`,
                    },
                });
                
                const { name, email, picture } = response.data;

                toast.success("Login successful");
                dispatch({
                    type: "LOGIN_USER",
                    payload: { name, email, profile: picture },
                });
            } catch (error) {
                toast.error("Something went wrong, try again!");
            } finally {
                setLoading(false);
            }
        },
        onError: (error) => {
            toast.error("Login failed, try again!");
            setLoading(false);
        },
    });

    const handleLogout = () => {
        dispatch({ type: 'LOGOUT_USER' })
    }

    return (
        <>
            <header className="w-full bg-transparent flex justify-between items-center gap-2 min-h-10 py-2 px-3 sm:px-5">
                <div className="w-auto flex justify-between items-center gap-2 sm:gap-4">
                    <Link to={'/'} className="text-amber-400 hover:text-white duration-100 ease-linear w-8 h-8 rounded overflow-hidden bg-white hover:bg-amber-400 flex justify-center items-center">
                        {user.profile ? <img className="w-full h-full object-cover" src={user.profile} alt={user.name} width={32} height={32} /> : <IoHome size={24} />}
                    </Link>
                    <div className="text-white text-sm max-w-36 md:max-w-64">
                        <p title={user.name && user.name} className="truncate">{user.name ? `Hi, ${user.name}` : 'Welcome,'}</p>
                        <p className="font-bold truncate">{getGreeting()}</p>
                    </div>
                </div>

                <div className="flex justify-between items-center gap-2 sm:gap-4">
                    <label title="Toggle Temprature Unit" aria-label="Toggle Temprature Unit" className="relative hidden sm:inline-flex items-center cursor-pointer">
                        <input
                            className="sr-only peer"
                            checked={user.tempUnit === 'F'}
                            onChange={handleToggleUnit}
                            type="checkbox" />
                        <div className="peer rounded-full outline-none duration-100 after:duration-500 w-14 h-8 bg-blue-400 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500  after:content-['°C'] after:absolute after:outline-none after:rounded-full after:h-6 after:w-6 after:bg-white after:top-1 after:left-1 after:flex after:justify-center after:items-center  after:text-sky-800 after:font-bold peer-checked:after:translate-x-6 peer-checked:after:content-['°F'] peer-checked:after:border-white">
                        </div>
                    </label>
                    <div 
                    onClick={() => setIsSearchOpen(true)}
                    title="Search Cities..." aria-label="Search Cities..." className="flex items-center md:min-w-60 gap-3 cursor-pointer bg-(--dark-color) py-2 px-2 sm:px-3.5 rounded-full text-white">
                        <IoSearch size={20} />
                        <p className="text-gray-300 hover:text-white text-sm hidden sm:block">Search City...</p>
                    </div>
                    {!user.profile &&
                        <button
                            title="Login via Google"
                            aria-label="Login via Google"
                            onClick={handleLogin}
                            className="w-9 h-9 rounded-full flex justify-center items-center cursor-pointer border-(--dark-color) border-2 bg-white">
                            {loading ? '...' : <FcGoogle size={22} />}
                        </button>}
                    {user.isLoggedIn &&
                        <button
                            title="Logout"
                            aria-label="Logout"
                            onClick={handleLogout}
                            className="w-9 h-9 text-white rounded-full flex justify-center items-center cursor-pointer border-(--dark-color) border-2 bg-red-500">
                            <IoLogOut size={22} />
                        </button>}
                </div>
            </header>

            {isSearchOpen && <Search onClose={() => setIsSearchOpen(false)} />}
        </>
    );
}
