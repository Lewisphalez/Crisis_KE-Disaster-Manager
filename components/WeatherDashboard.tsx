import React, { useEffect, useState } from 'react';
import { fetchWeather, getWeatherIcon } from '../services/externalApiService';
import { WeatherData } from '../types';
import { Cloud, CloudRain, Sun, Wind, CloudLightning, MapPin, Navigation } from 'lucide-react';

const CITIES = [
  { name: 'Nairobi', lat: -1.2921, lng: 36.8219 },
  { name: 'Mombasa', lat: -4.0435, lng: 39.6682 },
  { name: 'Kisumu', lat: -0.0917, lng: 34.7680 },
  { name: 'Turkana', lat: 3.1167, lng: 35.6000 },
  { name: 'Nakuru', lat: -0.3031, lng: 36.0800 }
];

const WeatherDashboard: React.FC = () => {
  const [regionalWeather, setRegionalWeather] = useState<WeatherData[]>([]);
  const [localWeather, setLocalWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [locationStatus, setLocationStatus] = useState<'requesting' | 'denied' | 'found'>('requesting');

  useEffect(() => {
    const initWeather = async () => {
      // 1. Fetch Regional Data in parallel
      const regionalPromises = CITIES.map(city => fetchWeather(city.lat, city.lng, city.name));
      
      // 2. Attempt Geolocation for Local Data
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            try {
                // Fetch local weather
                const localData = await fetchWeather(latitude, longitude, "Current Location");
                setLocalWeather(localData);
                setLocationStatus('found');
            } catch (e) {
                console.error("Failed to fetch local weather", e);
            }
            
            // Finish up regional
            const regionalResults = await Promise.all(regionalPromises);
            setRegionalWeather(regionalResults.filter(w => w !== null) as WeatherData[]);
            setLoading(false);
          },
          async (error) => {
            console.warn("Location denied:", error);
            setLocationStatus('denied');
            // Even if local fails, load regional
            const regionalResults = await Promise.all(regionalPromises);
            setRegionalWeather(regionalResults.filter(w => w !== null) as WeatherData[]);
            setLoading(false);
          }
        );
      } else {
        setLocationStatus('denied');
        const regionalResults = await Promise.all(regionalPromises);
        setRegionalWeather(regionalResults.filter(w => w !== null) as WeatherData[]);
        setLoading(false);
      }
    };

    initWeather();
  }, []);

  const getIconComponent = (code: number, className: string = "w-8 h-8") => {
    const iconName = getWeatherIcon(code);
    switch (iconName) {
      case 'rain': return <CloudRain className={`${className} text-blue-400`} />;
      case 'storm': return <CloudLightning className={`${className} text-purple-500`} />;
      case 'fog': 
      case 'cloud': return <Cloud className={`${className} text-slate-400`} />;
      default: return <Sun className={`${className} text-yellow-500`} />;
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-12 space-y-4">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      <p className="text-sm text-slate-500 animate-pulse">Scanning satellites...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Section 1: Local Weather */}
      <div>
        <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
            <Navigation className="w-5 h-5 text-blue-600" /> Your Location
        </h3>

        {localWeather ? (
             <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-1/4 -translate-y-1/4">
                    {getIconComponent(localWeather.conditionCode, "w-48 h-48 text-white")}
                </div>
                
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 text-blue-100 text-sm font-medium mb-1">
                            <MapPin className="w-4 h-4" />
                            {locationStatus === 'found' ? 'Detected Location' : 'Default Location'}
                        </div>
                        <h2 className="text-4xl font-bold mb-2">{localWeather.temperature}°C</h2>
                        <div className="flex items-center gap-2">
                             {getIconComponent(localWeather.conditionCode, "w-6 h-6 text-white")}
                             <span className="text-lg font-medium">
                                {localWeather.conditionCode < 3 ? 'Clear / Sunny' : localWeather.conditionCode < 50 ? 'Cloudy' : 'Raining'}
                             </span>
                        </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 min-w-[150px] border border-white/20">
                        <div className="flex items-center gap-2 mb-2">
                            <Wind className="w-4 h-4 text-blue-200" />
                            <span className="text-xs font-bold uppercase tracking-wider text-blue-200">Wind</span>
                        </div>
                        <p className="text-xl font-bold">{localWeather.windSpeed} <span className="text-sm font-normal opacity-80">km/h</span></p>
                    </div>
                </div>
             </div>
        ) : (
            <div className="bg-slate-100 rounded-xl p-6 text-center text-slate-500 border border-dashed border-slate-300">
                <p>Location access needed for local forecast.</p>
                <button 
                    onClick={() => window.location.reload()}
                    className="mt-2 text-blue-600 font-bold text-sm hover:underline"
                >
                    Try Allowing Location
                </button>
            </div>
        )}
      </div>

      {/* Section 2: Regional Forecast */}
      <div>
        <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
            <Sun className="w-5 h-5 text-orange-500" /> Regional Forecast
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {regionalWeather.map((data) => (
            <div key={data.locationName} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center text-center relative overflow-hidden hover:shadow-md transition-shadow group">
                {data.temperature > 30 && (
                    <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-bl-lg font-bold">HEAT</div>
                )}
                
                <div className="mb-3 transform group-hover:scale-110 transition-transform duration-300">
                    {getIconComponent(data.conditionCode, "w-10 h-10")}
                </div>
                
                <h4 className="font-bold text-slate-700 text-sm mb-1">{data.locationName}</h4>
                <div className="text-2xl font-bold text-slate-900 mb-2">{data.temperature}°</div>
                
                <div className="w-full pt-2 border-t border-slate-50 flex justify-center items-center gap-1 text-xs text-slate-400">
                    <Wind className="w-3 h-3" />
                    <span>{data.windSpeed}</span>
                </div>
            </div>
            ))}
        </div>
      </div>

      <div className="flex justify-center">
        <p className="text-[10px] text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
            Live weather data provided by Open-Meteo API
        </p>
      </div>
    </div>
  );
};

export default WeatherDashboard;