import { useQueries } from "@tanstack/react-query";
import WeatherCard from "../WeatherCard";
import Loader from "../Loader"
import axios from "axios";
import { useSelector } from "react-redux";

const DEFAULT_CITIES = ["Mumbai, Maharashtra, India", "Delhi, Delhi, India", "Bangalore, Karnataka, India", "Kolkata, West Bengal, India", "Chennai, Tamil Nadu, India", "Jaipur, Rajasthan, India", "Hyderabad, Telangana, India"];
const API_URL = import.meta.env.VITE_WEATHER_API_URL;
const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

export default function HomeTopLeft() {

    const user = useSelector((state) => state.userReducer);

    const cityList = (() => {
        const cities = [];

        if (user?.location && user.location.trim()) {
            cities.push(user.location.trim());
        }

        if (Array.isArray(user?.favouriteCities)) {
            for (const c of user.favouriteCities) {
                if (c && !cities.includes(c)) cities.push(c);
            }
        }

        for (const city of DEFAULT_CITIES) {
            if (cities.length >= 6) break;
            if (!cities.includes(city)) cities.push(city);
        }

        return cities;
    })();

    const weatherQueries = useQueries({
        queries: cityList.map((city) => ({
            queryKey: ["weather", city],
            queryFn: async () => {
                const res = await axios.get(`${API_URL}/current.json`, {
                    params: { key: API_KEY, q: city, aqi: "no" },
                });
                return res.data;
            },
            retry: 2,
        })),
    });

    return (
        <div className="w-full flex items-center xl:grid grid-cols-2 gap-4 xl:gap-2 whitespace-nowrap xl:whitespace-normal overflow-x-auto xl:overflow-x-hidden pb-2 xl:pb-0">
            {weatherQueries.map((query, idx) => {
                if (query.isLoading) return <Loader key={cityList[idx]} />;
                if (query.isError || !query.data) return (
                    <div
                        key={cityList[idx]}
                        className="bg-gray-900/80 border border-red-500/20 rounded-2xl p-5 min-w-80 inline-flex text-white/60 text-sm items-center justify-center"
                    >
                        ⚠ Failed to load {cityList[idx]}
                    </div>
                );
                return <WeatherCard key={cityList[idx]} data={query.data} />;
            })}
        </div>
    );
}
