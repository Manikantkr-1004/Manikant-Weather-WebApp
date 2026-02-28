import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { FaLocationDot } from "react-icons/fa6";
import toast from "react-hot-toast";
import { useState } from "react";
import HomeTopLeft from "../components/Home/HomeTopLeft";
import HomeTopRight from "../components/Home/HomeTopRight";

const API_URL = import.meta.env.VITE_WEATHER_API_URL;
const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

export default function Home() {

    const dispatch = useDispatch();
    const user = useSelector((state) => state.userReducer);

    const [loading, setLoading] = useState(false);

    const handleToggleUnit = (e) => {
        dispatch({ type: 'SET_TEMP_UNIT', payload: e.target.checked ? 'F' : 'C' })
    }

    const handleGetLocation = async () => {
        try {
            if (!navigator.geolocation) {
                toast.error("Geolocation is not supported by your browser");
                return;
            }
            setLoading(true);
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
            });

            const { latitude, longitude } = position.coords;

            const res = await axios.get(`${API_URL}/current.json`, {
                params: { key: API_KEY, q: `${latitude},${longitude}`, aqi: "no" },
            });

            const { name, region, country } = res.data.location;

            dispatch({ type: "SET_LOCATION", payload: `${name}, ${region}, ${country}` });
            
            toast.success(`Location set to ${name}, ${region}, ${country}`);
        } catch (error) {
            toast.error(error.message || "Unable to retrieve location");
        } finally{
            setLoading(false);
        }
    };

    return (
        <main className="w-full py-3 md:py-6 px-3 sm:px-5">

            <div className="w-full flex flex-row-reverse sm:flex-row justify-between sm:justify-start items-center gap-2 mb-2">
                <div className="w-2/3 sm:w-auto flex flex-col items-end sm:items-start gap-1">
                    <button 
                    onClick={handleGetLocation}
                    disabled={loading}
                    className={`${loading && 'animate-pulse'} w-fit text-xs font-semibold hover:scale-95 duration-200 ease-linear bg-gray-100 rounded-full shadow-lg px-3 py-1 flex items-center gap-1 cursor-pointer`}><FaLocationDot size={16} /> {user.location ? 'Update Your Location' : "Set Your Location"}</button>
                    {user.location && <p className="text-xs text-white truncate text-right sm:text-left">{loading ? '...' : user.location}</p>}
                </div>
                <div>
                    <label title="Toggle Temprature Unit" aria-label="Toggle Temprature Unit" className="relative inline-flex sm:hidden items-center cursor-pointer">
                        <input
                            className="sr-only peer"
                            checked={user.tempUnit === 'F'}
                            onChange={handleToggleUnit}
                            type="checkbox" />
                        <div className="peer rounded-full outline-none duration-100 after:duration-500 w-14 h-8 bg-blue-400 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500  after:content-['°C'] after:absolute after:outline-none after:rounded-full after:h-6 after:w-6 after:bg-white after:top-1 after:left-1 after:flex after:justify-center after:items-center  after:text-sky-800 after:font-bold peer-checked:after:translate-x-6 peer-checked:after:content-['°F'] peer-checked:after:border-white">
                        </div>
                    </label>
                </div>
            </div>

            <div className="w-full grid grid-cols-1 xl:grid-cols-2 gap-5">
                <HomeTopLeft />
                <HomeTopRight />
            </div>

            <p className="text-sm text-white/30 mt-6 text-center">Designed & Developed by Manikant Kumar</p>

        </main>
    );
}