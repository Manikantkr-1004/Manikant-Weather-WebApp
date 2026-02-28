import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
    AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
    BarChart, Bar
} from "recharts";
import { FaLocationDot, FaWind, FaArrowLeft, FaHeart } from "react-icons/fa6";
import { FaCompressAlt } from "react-icons/fa";
import { IoSunny, IoMoon } from "react-icons/io5";
import { WiHumidity } from "react-icons/wi";
import { MdVisibility } from "react-icons/md";
import { WiBarometer } from "react-icons/wi";
import Loader from "../components/Loader";
import { useDispatch, useSelector } from "react-redux";

const API_URL = import.meta.env.VITE_WEATHER_API_URL;
const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

export default function CityDetails() {

    const dispatch = useDispatch();
    const user = useSelector((state) => state.userReducer);
    const { cityName } = useParams();
    const navigate = useNavigate();

    const { data: current, isLoading: loadingCurrent, isError: errorCurrent } = useQuery({
        queryKey: ["weatherDetails", cityName],
        queryFn: async () => {
            const res = await axios.get(`${API_URL}/current.json`, {
                params: { key: API_KEY, q: cityName, aqi: "yes" },
            });
            return res.data;
        },
    });

    const { data: forecast, isLoading: loadingForecast } = useQuery({
        queryKey: ["forecastDetails", cityName],
        queryFn: async () => {
            const res = await axios.get(`${API_URL}/forecast.json`, {
                params: { key: API_KEY, q: cityName, days: 7, aqi: "yes", alerts: "yes" },
            });
            return res.data;
        }
    });

    if (loadingCurrent || loadingForecast) return <div className="w-full min-h-screen flex justify-center items-center"><Loader /></div>
    if (errorCurrent) return (
        <main className="min-h-screen bg-gray-950 flex items-center justify-center text-white w-full px-5">
            <p>⚠ Failed to load weather for <strong>{cityName}</strong></p>
        </main>
    );

    const c = current.current;
    const loc = current.location;
    const theme = getWeatherTheme(c.condition.text);
    const forecastDays = forecast?.forecast?.forecastday || [];
    const todayHours = forecastDays[0]?.hour || [];
    const alerts = forecast?.alerts?.alert || [];

    // Hour-by-hour temp data
    const hourlyData = todayHours
        .filter((_, i) => i % 2 === 0) // every 2 hours
        .map(h => ({
            time: h.time.split(" ")[1],
            Temp: Math.round(user.tempUnit==='C' ? h.temp_c : h.temp_f),
            "Feels Like": Math.round(user.tempUnit==='C' ? h.feelslike_c : h.feelslike_f),
            Rain: h.chance_of_rain,
        }));

    // 7-day forecast data
    const weekData = forecastDays.map(d => ({
        day: new Date(d.date).toLocaleDateString("en-US", { weekday: "short" }),
        Max: Math.round(user.tempUnit==='C' ? d.day.maxtemp_c : d.day.maxtemp_f),
        Min: Math.round(user.tempUnit==='C' ? d.day.mintemp_c : d.day.mintemp_f),
        Rain: d.day.daily_chance_of_rain,
        icon: d.day.condition.icon,
        text: d.day.condition.text,
    }));

    // Wind direction to degrees
    const windDeg = c.wind_degree;
    const aqi = c.air_quality?.["us-epa-index"];
    const aqiLabels = ["", "Good", "Moderate", "Unhealthy (Sensitive)", "Unhealthy", "Very Unhealthy", "Hazardous"];
    const aqiColors = ["", "#22c55e", "#eab308", "#f97316", "#ef4444", "#7c3aed", "#991b1b"];

    const handleFavourite = (cityName) => {
        if (user.favouriteCities.includes(cityName)) {
            dispatch({ type: 'REMOVE_FAVOURITE_CITY', payload: cityName });
            toast.success(`${cityName} removed from favourites`);
        } else {
            dispatch({ type: 'ADD_FAVOURITE_CITY', payload: cityName })
            toast.success(`${cityName} added to favourites`);
        }
    }

    return (
        <main className="min-h-screen text-white pb-16">
            {/* Hero gradient banner */}
            <div
                className="relative w-full px-5 pt-8 pb-10 overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${theme.from}22 0%, ${theme.via}11 50%, transparent 100%)` }}
            >
                {/* Big blurred glow */}
                <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full blur-3xl opacity-20"
                    style={{ background: theme.from }} />
                <div className="absolute -bottom-10 -left-10 w-64 h-64 rounded-full blur-3xl opacity-10"
                    style={{ background: theme.via }} />

                {/* Top shimmer line */}
                <div className="absolute top-0 left-0 right-0 h-px"
                    style={{ background: `linear-gradient(90deg, transparent, ${theme.accent}60, transparent)` }} />

                <div className="relative max-w-6xl mx-auto">
                    {/* Back button */}
                    <button
                        onClick={() => navigate(-1)}
                        className="mb-6 flex items-center cursor-pointer gap-2 text-white/50 hover:text-white transition-colors text-sm group"
                    >
                        <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                        Back
                    </button>

                    <button
                        aria-label="Add City in Favourite"
                        title="Mark City as Favourite"
                        onClick={() => handleFavourite(`${loc.name}, ${loc.region}, ${loc.country}`)}
                        className={`absolute top-0 lg:top-1/2 right-0 lg:right-1/2 cursor-pointer ${user.favouriteCities.includes(`${loc.name}, ${loc.region}, ${loc.country}`) ? 'text-red-400' : 'text-white/50 hover:text-white'} transition-colors duration-200`}>
                        <FaHeart size={32} />
                    </button>

                    <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
                        {/* Left - main info */}
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-2 text-white/50 text-sm">
                                <FaLocationDot style={{ color: theme.accent }} />
                                <span>{loc.name}, {loc.region}, {loc.country}</span>
                            </div>
                            <div className="flex items-end gap-4">
                                <p className="text-8xl font-black tracking-tighter leading-none">
                                    {Math.round(user.tempUnit==='C' ? c.temp_c : c.temp_f)}°
                                </p>
                                <div className="pb-2 flex flex-col gap-1">
                                    <p className="text-xl text-white/70">{c.condition.text}</p>
                                    <p className="text-sm text-white/40">Feels like {Math.round(user.tempUnit==='C' ? c.feelslike_c : c.feelslike_f)}°{user.tempUnit}</p>
                                    <p className="text-xs text-white/30">
                                        {new Date(loc.localtime).toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long" })}
                                        {" · "}
                                        {new Date(loc.localtime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                                    </p>
                                </div>
                            </div>
                            {forecastDays[0] && (
                                <p className="text-sm text-white/40">
                                    H: <span className="text-white/70">{Math.round(user.tempUnit==='C' ? forecastDays[0].day.maxtemp_c : forecastDays[0].day.maxtemp_f)}°</span>
                                    {"  ·  "}
                                    L: <span className="text-white/70">{Math.round(user.tempUnit==='C' ? forecastDays[0].day.mintemp_c : forecastDays[0].day.mintemp_f)}°</span>
                                </p>
                            )}
                        </div>

                        {/* Right - icon */}
                        <img
                            src={`https:${c.condition.icon.replace("64x64", "128x128")}`}
                            alt={c.condition.text}
                            className="w-32 h-32 brightness-125 drop-shadow-2xl animate-pulse"
                        />
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-5 flex flex-col gap-6 mt-6">

                {/* Alerts */}
                {alerts.length > 0 && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex flex-col gap-2">
                        <p className="text-red-400 font-semibold text-sm uppercase tracking-wider">⚠ Weather Alerts</p>
                        {alerts.map((a, i) => (
                            <p key={i} className="text-white/70 text-sm">{a.headline}</p>
                        ))}
                    </div>
                )}

                {/* Stats grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <StatCard icon={<WiHumidity size={18} />} label="Humidity" value={`${c.humidity}%`} sub="Relative humidity" accent={theme.accent} />
                    <StatCard icon={<FaWind size={14} />} label="Wind" value={`${c.wind_mph} mph`} sub={`${c.wind_dir} · ${c.wind_degree}°`} accent={theme.accent} />
                    <StatCard icon={<FaCompressAlt size={14} />} label="Pressure" value={`${c.pressure_mb}`} sub="hPa" accent={theme.accent} />
                    <StatCard icon={<MdVisibility size={16} />} label="Visibility" value={`${c.vis_miles} mi`} sub={`${c.vis_km} km`} accent={theme.accent} />
                    <StatCard icon={<IoSunny size={16} />} label="UV Index" value={c.uv} sub={c.uv <= 2 ? "Low" : c.uv <= 5 ? "Moderate" : c.uv <= 7 ? "High" : "Very High"} accent={theme.accent} />
                    <StatCard icon={<WiBarometer size={20} />} label="Cloud Cover" value={`${c.cloud}%`} sub="Sky coverage" accent={theme.accent} />
                    <StatCard icon={<IoMoon size={14} />} label="Precip" value={`${c.precip_mm} mm`} sub="Today so far" accent={theme.accent} />
                </div>

                {/* Hourly temperature chart */}
                <div className="bg-(--dark-color)/80 border border-white/10 rounded-3xl p-5">
                    <p className="text-white/50 text-xs uppercase tracking-widest font-medium mb-4">Hourly Temperature Today</p>
                    <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={theme.accent} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={theme.accent} stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="feelGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={theme.via} stopOpacity={0.2} />
                                    <stop offset="95%" stopColor={theme.via} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="time" tick={{ fill: "#ffffff40", fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: "#ffffff40", fontSize: 11 }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip unit={`${user.tempUnit === 'C' ? '°C' : '°F'}`} />} />
                            <Area type="monotone" dataKey="Temp" stroke={theme.accent} strokeWidth={2} fill="url(#tempGrad)" dot={false} />
                            <Area type="monotone" dataKey="Feels Like" stroke={theme.via} strokeWidth={1.5} strokeDasharray="4 2" fill="url(#feelGrad)" dot={false} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Rain chance chart */}
                <div className="bg-(--dark-color)/80 border border-white/10 rounded-3xl p-5">
                    <p className="text-white/50 text-xs uppercase tracking-widest font-medium mb-4">Hourly Rain Chance (%)</p>
                    <ResponsiveContainer width="100%" height={160}>
                        <BarChart data={hourlyData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                            <XAxis dataKey="time" tick={{ fill: "#ffffff40", fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: "#ffffff40", fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                            <Tooltip content={<CustomTooltip unit="%" />} />
                            <Bar dataKey="Rain" fill="#3b82f6" radius={[4, 4, 0, 0]} opacity={0.8} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* 7-day forecast */}
                <div className="bg-(--dark-color)/80 border border-white/10 rounded-3xl p-5">
                    <p className="text-white/50 text-xs uppercase tracking-widest font-medium mb-4">7-Day Forecast</p>
                    <div className="flex flex-wrap items-center sm:justify-around gap-2">
                        {weekData.map((d, i) => (
                            <div
                                key={i}
                                className={`min-w-16 flex flex-col items-center gap-2 p-2 rounded-2xl transition-all ${i === 0 ? "bg-white/10 border border-white/15" : "hover:bg-white/5"}`}
                            >
                                <p className="text-xs text-white/50 font-medium">{i === 0 ? "Today" : d.day}</p>
                                <img src={`https:${d.icon}`} alt={d.text} className="w-8 h-8" />
                                <p className="text-xs font-bold text-white">{d.Max}°</p>
                                <p className="text-xs text-white/40">{d.Min}°</p>
                                <div className="w-full bg-white/10 rounded-full h-1">
                                    <div
                                        className="h-1 rounded-full bg-blue-400"
                                        style={{ width: `${d.Rain}%`, opacity: 0.8 }}
                                    />
                                </div>
                                <p className="text-xs text-blue-400">{d.Rain}%</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 7-day max/min bar chart */}
                <div className="bg-(--dark-color) border border-white/10 rounded-3xl p-5">
                    <p className="text-white/50 text-xs uppercase tracking-widest font-medium mb-4">Weekly Temperature Range</p>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={weekData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                            <XAxis dataKey="day" tick={{ fill: "#ffffff40", fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: "#ffffff40", fontSize: 11 }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip unit="°C" />} />
                            <Bar dataKey="Max" fill={theme.accent} radius={[4, 4, 0, 0]} opacity={0.9} />
                            <Bar dataKey="Min" fill={theme.via} radius={[4, 4, 0, 0]} opacity={0.5} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Wind + AQI row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    {/* Wind compass */}
                    <div className="bg-(--dark-color)/50 border border-white/10 rounded-3xl p-5 flex flex-col gap-4">
                        <p className="text-white/50 text-xs uppercase tracking-widest font-medium">Wind Direction</p>
                        <div className="flex items-center justify-center">
                            <div className="relative w-36 h-36">
                                {/* Compass ring */}
                                <div className="absolute inset-0 rounded-full border-2 border-white/10 flex items-center justify-center">
                                    {["N", "E", "S", "W"].map((dir, i) => (
                                        <span
                                            key={dir}
                                            className="absolute text-xs text-white/30 font-medium"
                                            style={{
                                                top: i === 0 ? "4px" : i === 2 ? "auto" : "50%",
                                                bottom: i === 2 ? "4px" : "auto",
                                                left: i === 3 ? "4px" : i === 1 ? "auto" : "50%",
                                                right: i === 1 ? "4px" : "auto",
                                                transform: (i === 0 || i === 2) ? "translateX(-50%)" : "translateY(-50%)",
                                            }}
                                        >{dir}</span>
                                    ))}
                                    {/* Arrow */}
                                    <div
                                        className="absolute w-1 h-14 rounded-full origin-bottom"
                                        style={{
                                            background: `linear-gradient(to top, ${theme.accent}, transparent)`,
                                            bottom: "50%",
                                            left: "calc(50% - 2px)",
                                            transform: `rotate(${windDeg}deg)`,
                                            transformOrigin: "bottom center",
                                        }}
                                    />
                                    <div className="w-3 h-3 rounded-full z-10" style={{ background: theme.accent }} />
                                </div>
                            </div>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold">{c.wind_mph} <span className="text-sm font-normal text-white/40">mph</span></p>
                            <p className="text-sm text-white/40">{c.wind_dir} · Gusts {c.gust_mph} mph</p>
                        </div>
                    </div>

                    {/* AQI */}
                    <div className="bg-(--dark-color)/50 border border-white/10 rounded-3xl p-5 flex flex-col gap-4">
                        <p className="text-white/50 text-xs uppercase tracking-widest font-medium">Air Quality Index</p>
                        {aqi ? (
                            <>
                                <div className="flex items-center gap-4">
                                    <div
                                        className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-black"
                                        style={{ background: `${aqiColors[aqi]}22`, color: aqiColors[aqi], border: `1px solid ${aqiColors[aqi]}40` }}
                                    >
                                        {aqi}
                                    </div>
                                    <div>
                                        <p className="text-lg font-semibold" style={{ color: aqiColors[aqi] }}>{aqiLabels[aqi]}</p>
                                        <p className="text-sm text-white/40">US EPA Index</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    {[
                                        ["CO", c.air_quality?.co?.toFixed(1), "μg/m³"],
                                        ["NO₂", c.air_quality?.no2?.toFixed(1), "μg/m³"],
                                        ["O₃", c.air_quality?.o3?.toFixed(1), "μg/m³"],
                                        ["PM2.5", c.air_quality?.pm2_5?.toFixed(1), "μg/m³"],
                                    ].map(([label, val, unit]) => (
                                        <div key={label} className="bg-white/5 rounded-xl p-2 flex justify-between items-center">
                                            <span className="text-white/40 text-xs">{label}</span>
                                            <span className="text-white text-xs font-semibold">{val} <span className="text-white/30">{unit}</span></span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <p className="text-white/30 text-sm">AQI data not available</p>
                        )}
                    </div>
                </div>

                {/* Sunrise / Sunset */}
                {forecastDays[0]?.astro && (
                    <div className="bg-(--dark-color) border border-white/10 rounded-3xl p-5">
                        <p className="text-white/50 text-xs uppercase tracking-widest font-medium mb-4">Sun & Moon</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                ["🌅", "Sunrise", forecastDays[0].astro.sunrise],
                                ["🌇", "Sunset", forecastDays[0].astro.sunset],
                                ["🌕", "Moonrise", forecastDays[0].astro.moonrise],
                                ["🌑", "Moonset", forecastDays[0].astro.moonset],
                            ].map(([emoji, label, val]) => (
                                <div key={label} className="flex flex-col gap-1 items-center text-center">
                                    <span className="text-2xl">{emoji}</span>
                                    <p className="text-white/40 text-xs">{label}</p>
                                    <p className="text-white font-semibold">{val}</p>
                                </div>
                            ))}
                        </div>
                        <p className="text-center text-white/30 text-xs mt-3">Moon phase: {forecastDays[0].astro.moon_phase}</p>
                    </div>
                )}

            </div>
        </main>
    );
}

function getWeatherTheme(conditionText = "") {
    const t = conditionText.toLowerCase();
    if (t.includes("sunny") || t.includes("clear"))
        return { from: "#f59e0b", via: "#fb923c", accent: "#fbbf24", badge: "bg-amber-500/20 text-amber-300 border-amber-500/30" };
    if (t.includes("rain") || t.includes("drizzle") || t.includes("shower"))
        return { from: "#3b82f6", via: "#06b6d4", accent: "#60a5fa", badge: "bg-blue-500/20 text-blue-300 border-blue-500/30" };
    if (t.includes("cloud") || t.includes("overcast"))
        return { from: "#64748b", via: "#94a3b8", accent: "#cbd5e1", badge: "bg-slate-500/20 text-slate-300 border-slate-500/30" };
    if (t.includes("snow") || t.includes("blizzard"))
        return { from: "#bae6fd", via: "#e0f2fe", accent: "#7dd3fc", badge: "bg-sky-500/20 text-sky-200 border-sky-400/30" };
    if (t.includes("thunder") || t.includes("storm"))
        return { from: "#7c3aed", via: "#6366f1", accent: "#a78bfa", badge: "bg-purple-500/20 text-purple-300 border-purple-500/30" };
    if (t.includes("fog") || t.includes("mist") || t.includes("haze"))
        return { from: "#6b7280", via: "#9ca3af", accent: "#d1d5db", badge: "bg-gray-500/20 text-gray-300 border-gray-500/30" };
    return { from: "#3b82f6", via: "#8b5cf6", accent: "#60a5fa", badge: "bg-blue-500/20 text-blue-300 border-blue-500/30" };
}

function StatCard({ icon, label, value, sub, accent }) {
    return (
        <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 flex flex-col gap-2 overflow-hidden group hover:bg-white/8 transition-all duration-300">
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: `radial-gradient(circle at 50% 0%, ${accent}15 0%, transparent 70%)` }} />
            <div className="flex items-center gap-2 text-white/40 text-xs uppercase tracking-widest font-medium">
                <span style={{ color: accent }}>{icon}</span>
                {label}
            </div>
            <p className="text-2xl font-bold text-white">{value}</p>
            {sub && <p className="text-xs text-white/40">{sub}</p>}
        </div>
    );
}

function CustomTooltip({ active, payload, label, unit = "" }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-gray-900/95 border border-white/10 rounded-xl px-3 py-2 text-sm shadow-xl">
            <p className="text-white/50 mb-1">{label}</p>
            {payload.map((p, i) => (
                <p key={i} style={{ color: p.color }} className="font-semibold">
                    {p.name}: {p.value}{unit}
                </p>
            ))}
        </div>
    );
}