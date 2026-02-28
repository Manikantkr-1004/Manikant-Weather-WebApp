import { useSelector } from "react-redux";
import { FaLocationDot } from "react-icons/fa6";
import { Link } from "react-router-dom";
import { useQueries } from "@tanstack/react-query";
import axios from "axios";
import {
    AreaChart, Area, XAxis, YAxis, Tooltip,
    ResponsiveContainer, CartesianGrid
} from "recharts";
import Loader from "../Loader";
import { FaCity } from "react-icons/fa";
import { MdHolidayVillage } from "react-icons/md";

const API_URL = import.meta.env.VITE_WEATHER_API_URL;
const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
const DEFAULT_CITY = "Mumbai, Maharashtra, India";

export default function HomeTopRight() {
    const user = useSelector((state) => state.userReducer);
    const city = user?.location?.trim() || DEFAULT_CITY;
    const dates = getLast7Days();

    const historyQueries = useQueries({
        queries: dates.map((date) => ({
            queryKey: ["historyData", city, date],
            queryFn: async () => {
                const res = await axios.get(`${API_URL}/history.json`, {
                    params: { key: API_KEY, q: city, dt: date },
                });
                return res.data;
            },
            staleTime: Infinity, // historical data never changes
            gcTime: 1000 * 60 * 60 * 24, // cache for 24h
            retry: 1,
        })),
    });

    const isLoading = historyQueries.some(q => q.isLoading);
    const hasData = historyQueries.some(q => q.data);

    // Build chart data — one point per day
    const chartData = historyQueries.map((q, i) => {
        const day = q.data?.forecast?.forecastday?.[0];
        return {
            date: dates[i].slice(5), // "MM-DD"
            label: new Date(dates[i]).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
            Max: day ? Math.round(user.tempUnit==='C' ? day.day.maxtemp_c : day.day.maxtemp_f) : null,
            Min: day ? Math.round(user.tempUnit==='C' ? day.day.mintemp_c : day.day.mintemp_f) : null,
            Avg: day ? Math.round(user.tempUnit==='C' ? day.day.avgtemp_c : day.day.avgtemp_f) : null,
            Rain: day ? day.day.daily_chance_of_rain : null,
            Humidity: day ? day.day.avghumidity : null,
        };
    }).filter(d => d.Max !== null);

    return (
        <div className="w-full flex flex-col gap-6">

            <div className="w-full flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <p className="text-sm uppercase tracking-widest text-white font-medium">
                        Past 7 Days · (Historical Data) · {city}
                    </p>
                    {isLoading && (
                        <span className="text-xs text-white/20 animate-pulse"><Loader /></span>
                    )}
                </div>

                {isLoading && !hasData && (
                    <div className="w-full h-40 bg-white/5 rounded-2xl animate-pulse border border-white/5" />
                )}

                {hasData && (
                    <div className="flex flex-col gap-3">

                        {/* Temperature area chart */}
                        <div className="bg-(--dark-color)/80 border border-white/10 rounded-2xl p-4">
                            <p className="text-xs text-white/30 mb-3 uppercase tracking-wider">Temperature (°{user.tempUnit})</p>
                            <ResponsiveContainer width="100%" height={150}>
                                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -28, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="maxGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="minGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                                    <XAxis dataKey="date" tick={{ fill: "#ffffff30", fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: "#ffffff30", fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<CustomTooltip user={user} />} />
                                    <Area type="monotone" dataKey="Max" stroke="#f97316" strokeWidth={2} fill="url(#maxGrad)" dot={{ fill: "#f97316", r: 3 }} />
                                    <Area type="monotone" dataKey="Min" stroke="#60a5fa" strokeWidth={2} fill="url(#minGrad)" dot={{ fill: "#60a5fa", r: 3 }} />
                                    <Area type="monotone" dataKey="Avg" stroke="#a3a3a3" strokeWidth={1} strokeDasharray="3 2" fill="none" dot={false} />
                                </AreaChart>
                            </ResponsiveContainer>
                            <div className="flex items-center gap-4 mt-2 justify-end">
                                {[["Max", "#f97316"], ["Avg", "#a3a3a3"], ["Min", "#60a5fa"]].map(([l, c]) => (
                                    <span key={l} className="flex items-center gap-1 text-xs text-white/30">
                                        <span className="w-2 h-2 rounded-full inline-block" style={{ background: c }} />
                                        {l}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Rain + Humidity mini row */}
                        <div className="grid grid-cols-1 gap-3">
                            {/* Rain chance */}
                            <div className="bg-(--dark-color)/80 border border-white/10 rounded-2xl p-3">
                                <p className="text-xs text-white/30 mb-2 uppercase tracking-wider">Rain Chance</p>
                                <ResponsiveContainer width="100%" height={80}>
                                    <AreaChart data={chartData} margin={{ top: 2, right: 2, left: -30, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="rainGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="date" tick={{ fill: "#ffffff20", fontSize: 9 }} axisLine={false} tickLine={false} />
                                        <Tooltip content={<CustomTooltip user={user} />} />
                                        <Area type="monotone" dataKey="Rain" stroke="#3b82f6" strokeWidth={1.5} fill="url(#rainGrad)" dot={false} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Humidity */}
                            <div className="bg-(--dark-color)/80 border border-white/10 rounded-2xl p-3">
                                <p className="text-xs text-white/30 mb-2 uppercase tracking-wider">Avg Humidity</p>
                                <ResponsiveContainer width="100%" height={80}>
                                    <AreaChart data={chartData} margin={{ top: 2, right: 2, left: -30, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="humGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#34d399" stopOpacity={0.4} />
                                                <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="date" tick={{ fill: "#ffffff20", fontSize: 9 }} axisLine={false} tickLine={false} />
                                        <Tooltip content={<CustomTooltip user={user} />} />
                                        <Area type="monotone" dataKey="Humidity" stroke="#34d399" strokeWidth={1.5} fill="url(#humGrad)" dot={false} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Day summary cards */}
                        <div className="flex flex-wrap items-center justify-around sm:justify-between gap-1.5">
                            {chartData.map((d, i) => (
                                <div
                                    key={d.date}
                                    className={`min-w-16 flex flex-col items-center gap-1 p-2 rounded-xl text-center border transition-all
                                        ${i === chartData.length - 1
                                            ? "bg-white/15 border-white/15"
                                            : "bg-white/10 border-white/5 hover:bg-white/8"
                                        }`}
                                >
                                    <p className="text-xs text-white/30 font-medium leading-tight">
                                        {new Date(dates[i]).toLocaleDateString("en-US", { weekday: "short" })}
                                    </p>
                                    <p className="text-sm font-bold text-orange-400 leading-none">{d.Max}°</p>
                                    <p className="text-xs text-blue-400 leading-none">{d.Min}°</p>
                                    <div className="w-full bg-white/10 rounded-full h-0.5 mt-0.5">
                                        <div className="h-0.5 rounded-full bg-blue-400" style={{ width: `${d.Rain}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>

                    </div>
                )}
            </div>

            <div className="w-full flex flex-col gap-5">
                <p className="flex justify-start lg:justify-center text-xl items-center gap-1 font-semibold text-white">
                    <FaLocationDot /> Your Favourite Cities
                </p>
                {user.favouriteCities.length === 0 && (
                    <p className="text-sm text-blue-400 text-center my-5">Oops! There is no favourite</p>
                )}
                {user.favouriteCities.length > 0 && (
                    <div className="w-full flex flex-wrap items-center gap-2">
                        {user.favouriteCities.map((ele) => (
                            <Link
                                to={`/city/${ele}`}
                                key={ele}
                                className="relative bg-(--dark-color)/50 p-5 min-h-36 min-w-36 flex flex-col gap-2 rounded-lg border-2 hover:border-white border-(--dark-color) text-white font-semibold overflow-hidden"
                            >
                                <div className="flex items-center gap-2"><MdHolidayVillage size={20} /> {ele.split(',')[0]} </div>
                                <div className="flex items-center gap-2"><FaCity /> {ele.split(',')[1]} </div>
                                <div className="flex items-center gap-2"><FaLocationDot /> {ele.split(',')[2]} </div>
                                <FaLocationDot size={50} className="absolute top-0 right-0 opacity-20 rotate-15" />
                            </Link>
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
}

// Generate last 7 days date strings:
function getLast7Days() {
    return Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i +1)); // oldest → newest
        return d.toISOString().split("T")[0];
    });
}

function CustomTooltip({ active, payload, label, user }) {

    if (!active || !payload?.length) return null;
    return (
        <div className="bg-gray-900/95 border border-white/10 rounded-xl px-3 py-2 text-xs shadow-xl">
            <p className="text-white/40 mb-1">{label}</p>
            {payload.map((p, i) => (
                <p key={i} style={{ color: p.color }} className="font-semibold">
                    {p.name}: {p.value}{(p.name === "Rain" || p.name === "Humidity") ? "%" : `°${user.tempUnit}`}
                </p>
            ))}
        </div>
    );
}