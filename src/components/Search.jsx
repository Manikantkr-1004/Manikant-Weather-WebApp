import { useState, useCallback, useRef } from "react";
import { FaLocationDot, FaHeart } from "react-icons/fa6";
import { IoClose } from "react-icons/io5";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import Loader from "./Loader";

const API_URL = import.meta.env.VITE_WEATHER_API_URL;
const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

export default function Search({ onClose }) {
    const [inputValue, setInputValue] = useState("");
    const [throttledQuery, setThrottledQuery] = useState("");
    const throttleTimer = useRef(null);

    const dispatch = useDispatch();
    const user = useSelector((state) => state.userReducer);

    const handleInput = useCallback((e) => {
        const val = e.target.value;
        setInputValue(val);

        if (throttleTimer.current) return;

        throttleTimer.current = setTimeout(() => {
            setThrottledQuery(val.trim());
            throttleTimer.current = null;
        }, 250);
    }, []);

    const { data, isFetching, isError } = useQuery({
        queryKey: ["search", throttledQuery],
        queryFn: async () => {
            const res = await axios.get(`${API_URL}/search.json`, {
                params: { key: API_KEY, q: throttledQuery },
            });
            return res.data;
        },
        enabled: throttledQuery.length >= 2,
        retry: 1,
    });

    const toggleFavourite = (cityString, e) => {
        e.preventDefault();
        e.stopPropagation();
        const isFav = user.favouriteCities.includes(cityString);
        dispatch({
            type: isFav ? "REMOVE_FAVOURITE_CITY" : "ADD_FAVOURITE_CITY",
            payload: cityString,
        });
    };

    return (
        <div
            className={`w-full fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-start justify-center pt-16 px-4`}
        >
            <div className={`w-full max-w-lg flex flex-col gap-0`}>

                {/* Search box */}
                <div className={`w-full bg-gray-900 border border-white/15 rounded-2xl shadow-2xl overflow-hidden`}>

                    {/* Header */}
                    <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/10">
                        <FaLocationDot className="text-blue-400 shrink-0" size={16} />
                        <input
                            autoFocus
                            type="text"
                            value={inputValue}
                            onChange={handleInput}
                            placeholder="Search city, region or country..."
                            className="flex-1 bg-transparent text-white placeholder-white/25 text-base focus:outline-none"
                        />
                        <div className="flex items-center gap-2">
                            <button
                                onClick={onClose}
                                className="text-white/30 hover:text-white transition-colors p-1 cursor-pointer"
                            >
                                <IoClose size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Results */}
                    {throttledQuery?.length >=2 && (
                        <div className="flex flex-col divide-y divide-white/5 max-h-96 overflow-y-auto">
                            
                            {isFetching && <div className="py-3 flex justify-center items-center"><Loader /></div>}

                            {isError && (
                                <p className="text-red-400 text-sm text-center py-6">
                                    ⚠ Something went wrong. Try again.
                                </p>
                            )}

                            {!isFetching && !isError && data?.length === 0 && (
                                <div className="flex flex-col items-center gap-2 py-10 text-white/20">
                                    <FaLocationDot size={28} />
                                    <p className="text-sm">No results for "{throttledQuery}"</p>
                                </div>
                            )}

                            {data?.map((city) => {
                                const cityString = `${city.name}, ${city.region}, ${city.country}`;
                                const isFav = user.favouriteCities.includes(cityString);

                                return (
                                    <Link
                                        to={`/city/${cityString}`}
                                        key={city.id}
                                        onClick={() => onClose()}
                                        className="group flex items-center gap-3 px-4 py-3.5 hover:bg-white/5 transition-all duration-150"
                                    >
                                        {/* Icon */}
                                        <div className="w-8 h-8 rounded-full bg-blue-500/15 border border-blue-500/20 flex items-center justify-center shrink-0 group-hover:bg-blue-500/25 transition-colors">
                                            <FaLocationDot size={13} className="text-blue-400" />
                                        </div>

                                        {/* Text */}
                                        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                                            <p className="text-white text-sm font-semibold truncate">{city.name}</p>
                                            <p className="text-white/35 text-xs truncate">
                                                {[city.region, city.country].filter(Boolean).join(", ")}
                                            </p>
                                        </div>

                                        {/* Heart */}
                                        <button
                                            onClick={(e) => toggleFavourite(cityString, e)}
                                            className={`p-2 rounded-full transition-all cursor-pointer duration-200 shrink-0 ${
                                                isFav
                                                    ? "text-red-400 bg-red-400/10"
                                                    : "text-white/15 hover:text-white hover:bg-red-400/10"
                                            }`}
                                        >
                                            <FaHeart size={18} />
                                        </button>
                                    </Link>
                                );
                            })}

                        </div>
                    )}

                    {throttledQuery.length < 2 && !isFetching && (
                        <div className="flex flex-col items-center gap-2 py-10 text-white/15">
                            <FaLocationDot size={32} />
                            <p className="text-sm">Type at least 2 characters</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}