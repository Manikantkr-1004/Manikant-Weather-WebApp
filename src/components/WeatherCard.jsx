import { FaLocationDot } from "react-icons/fa6";
import { IoSunny } from "react-icons/io5";
import { WiHumidity } from "react-icons/wi";
import { FaWind } from "react-icons/fa6";
import { FaCompressAlt } from "react-icons/fa";
import { MdVisibility } from "react-icons/md";
import { FaHeart } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export default function WeatherCard({ data }) {

    const dispatch = useDispatch();
    const user = useSelector((state) => state.userReducer);
    const navigate = useNavigate();

    const current = data.current;
    const location = data.location;
    const condition = current.condition;
    const theme = getWeatherTheme(condition.text, current.is_day);
    const { day, date } = formatDate(location.localtime);

    const handleFavourite = (cityName) => {

        if(user.favouriteCities.includes(cityName)) {
            dispatch({ type: 'REMOVE_FAVOURITE_CITY', payload: cityName });
        } else {
            dispatch({ type: 'ADD_FAVOURITE_CITY', payload: cityName })
        }
    }

    return (
        <div key={location.name}
            className={`relative shadow-lg hover:scale-95 duration-200 ease-linear cursor-pointer bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 text-white rounded-2xl p-5 min-w-80 inline-block xl:block ${user.location===`${location.name}, ${location.region}, ${location.country}` ? 'border-gray-200 border-2' : 'border '+ theme.border} overflow-hidden`}
        >
            {/* Background glow blob */}
            <div
                className={`absolute -top-8 -right-8 w-40 h-40 rounded-full blur-2xl opacity-60 ${theme.glow}`}
            />
            <div
                className={`absolute -bottom-6 -left-6 w-32 h-32 rounded-full blur-2xl opacity-40 ${theme.glow}`}
            />

            {/* Blue lighting accent strip */}
            <div className={`absolute inset-0 bg-linear-to-br ${theme.gradient} pointer-events-none`} />

            {/* Shimmer line */}
            <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-white/30 to-transparent" />

            <div className="relative z-10">

                <button
                    aria-label="Add City in Favourite"
                    title="Mark City as Favourite"
                    onClick={() => handleFavourite(`${location.name}, ${location.region}, ${location.country}`)}
                    className={`absolute bottom-2 right-2 cursor-pointer ${user.favouriteCities.includes(`${location.name}, ${location.region}, ${location.country}`) ? 'text-red-400' : 'text-white/50 hover:text-white'} transition-colors duration-200`}>
                    <FaHeart size={32} />
                </button>

                {/* Location badge */}
                <p 
                onClick={()=> navigate(`/city/${location.name},${location.region},${location.country}`)}
                className="bg-blue-500/80 backdrop-blur-sm text-sm px-3 py-1 text-white rounded-full inline-flex items-center gap-1.5 font-medium">
                    <FaLocationDot size={12} />
                    {location.name}, {location.region}, {location.country}
                </p>

                <div className="flex justify-between items-start gap-5 mt-3" onClick={()=> navigate(`/city/${location.name},${location.region},${location.country}`)}>
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-0.5">
                            <p className="text-2xl font-light tracking-wide">{day}</p>
                            <p className="text-sm text-white/60">{date}</p>
                        </div>

                        <div className="flex flex-col gap-2">
                            <p className="text-5xl font-bold tracking-tighter">
                                {Math.round(user.tempUnit === 'C' ? current.temp_c : current.temp_f)}°
                                <span className="text-xl font-normal text-white/50 ml-1">{user.tempUnit === 'C' ? 'C' : 'F'}</span>
                            </p>
                            <div className="flex flex-col gap-1.5">
                                <div className="flex items-center gap-1.5 text-sm">
                                    <IoSunny size={14} className="text-yellow-300" />
                                    <span className="text-white/50">Heat Index</span>
                                    <span className="font-semibold text-yellow-300">{user.tempUnit === 'C' ? current.heatindex_c : current.heatindex_f}°</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-sm">
                                    <WiHumidity size={16} className="text-blue-300" />
                                    <span className="text-white/50">Humidity</span>
                                    <span className="font-semibold text-blue-300">{current.humidity}%</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-sm">
                                    <FaWind size={13} className="text-cyan-300" />
                                    <span className="text-white/50">{current.wind_dir} Wind</span>
                                    <span className="font-semibold text-cyan-300">{current.wind_mph} mph</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-sm">
                                    <FaCompressAlt size={13} className="text-indigo-300" />
                                    <span className="text-white/50">Pressure</span>
                                    <span className="font-semibold text-indigo-300">{current.pressure_mb} hPa</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-sm">
                                    <MdVisibility size={14} className="text-green-300" />
                                    <span className="text-white/50">Visibility</span>
                                    <span className="font-semibold text-green-300">{current.vis_miles} mi</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                        <img
                            className="w-24 brightness-125 drop-shadow-lg animate-pulse"
                            src={`https:${condition.icon.replace(/64x64/, "128x128")}`}
                            alt={condition.text}
                            width={96}
                            height={96}
                        />
                        <p className="text-lg font-medium text-right">{condition.text}</p>
                        <p className="text-sm text-white/50 text-right">
                            Feels like {Math.round(user.tempUnit === 'C' ? current.feelslike_c : current.feelslike_f)}°
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
}

function getWeatherTheme(conditionText = "", isDay = 1) {
    const text = conditionText.toLowerCase();

    if (text.includes("sunny") || text.includes("clear")) {
        return {
            gradient: "from-amber-500/30 via-orange-400/20 to-yellow-300/10",
            glow: "bg-yellow-400/20",
            accent: "shadow-yellow-500/20",
            border: "border-yellow-400/20",
        };
    }
    if (text.includes("rain") || text.includes("drizzle") || text.includes("shower")) {
        return {
            gradient: "from-blue-600/30 via-cyan-500/20 to-blue-400/10",
            glow: "bg-blue-400/20",
            accent: "shadow-blue-500/20",
            border: "border-blue-400/20",
        };
    }
    if (text.includes("cloud") || text.includes("overcast")) {
        return {
            gradient: "from-slate-500/30 via-gray-400/20 to-slate-300/10",
            glow: "bg-slate-400/20",
            accent: "shadow-slate-400/20",
            border: "border-slate-400/20",
        };
    }
    if (text.includes("snow") || text.includes("blizzard") || text.includes("ice")) {
        return {
            gradient: "from-sky-300/30 via-blue-200/20 to-white/10",
            glow: "bg-sky-200/20",
            accent: "shadow-sky-300/20",
            border: "border-sky-200/20",
        };
    }
    if (text.includes("thunder") || text.includes("storm")) {
        return {
            gradient: "from-purple-700/30 via-indigo-600/20 to-slate-500/10",
            glow: "bg-purple-500/20",
            accent: "shadow-purple-500/20",
            border: "border-purple-500/20",
        };
    }
    if (text.includes("fog") || text.includes("mist") || text.includes("haze")) {
        return {
            gradient: "from-gray-500/30 via-slate-400/20 to-gray-300/10",
            glow: "bg-gray-400/20",
            accent: "shadow-gray-400/20",
            border: "border-gray-400/20",
        };
    }
    // night default
    if (!isDay) {
        return {
            gradient: "from-indigo-900/30 via-blue-900/20 to-slate-800/10",
            glow: "bg-indigo-400/20",
            accent: "shadow-indigo-500/20",
            border: "border-indigo-400/20",
        };
    }
    // fallback
    return {
        gradient: "from-blue-500/30 via-cyan-400/20 to-sky-300/10",
        glow: "bg-blue-400/20",
        accent: "shadow-blue-400/20",
        border: "border-blue-400/20",
    };
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return {
        day: date.toLocaleDateString("en-US", { weekday: "long" }),
        date: date.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" }),
    };
}