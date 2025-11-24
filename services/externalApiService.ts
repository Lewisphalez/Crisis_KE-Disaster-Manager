import { WeatherData, NewsArticle } from "../types";

// Using Open-Meteo Free API (No key required)
export const fetchWeather = async (lat: number, lng: number, locationName: string): Promise<WeatherData | null> => {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true&timezone=auto`
    );
    const data = await response.json();
    
    return {
      temperature: data.current_weather.temperature,
      conditionCode: data.current_weather.weathercode,
      windSpeed: data.current_weather.windspeed,
      isDay: data.current_weather.is_day === 1,
      locationName: locationName
    };
  } catch (error) {
    console.error("Weather fetch failed:", error);
    return null;
  }
};

// Simulated News API (To ensure reliability without requiring user API keys)
export const fetchDisasterNews = async (): Promise<NewsArticle[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));

  return [
    {
      id: '1',
      title: 'El Niño Preparedness: County Govts urged to clear drainage systems',
      source: 'Daily Nation',
      timeAgo: '2h ago',
      category: 'Preparedness',
      imageUrl: 'https://images.unsplash.com/photo-1541960071727-c531398e7494?auto=format&fit=crop&q=80&w=400',
      url: 'https://nation.africa/kenya/news'
    },
    {
      id: '2',
      title: 'Traffic Alert: Heavy fog reported along Limuru Road',
      source: 'Ma3Route',
      timeAgo: '45m ago',
      category: 'Road Safety',
      imageUrl: 'https://images.unsplash.com/photo-1485732431145-c0490bb62d64?auto=format&fit=crop&q=80&w=400',
      url: 'https://twitter.com/Ma3Route'
    },
    {
      id: '3',
      title: 'Drought Alarm: NDMA flags 5 counties in Coast region',
      source: 'The Standard',
      timeAgo: '5h ago',
      category: 'Drought',
      imageUrl: 'https://images.unsplash.com/photo-1505562130589-324d9d1be6ce?auto=format&fit=crop&q=80&w=400',
      url: 'https://www.standardmedia.co.ke/topic/drought'
    },
    {
      id: '4',
      title: 'Red Cross launches emergency response app for rural areas',
      source: 'Kenya News Agency',
      timeAgo: '1d ago',
      category: 'Technology',
      imageUrl: 'https://images.unsplash.com/photo-1576091160550-217358c7e618?auto=format&fit=crop&q=80&w=400',
      url: 'https://www.redcross.or.ke/'
    }
  ];
};

export const getWeatherIcon = (code: number) => {
  // WMO Weather interpretation codes (WW)
  if (code === 0) return '☀️'; // Clear sky
  if (code >= 1 && code <= 3) return 'cloud'; // Partly cloudy
  if (code >= 45 && code <= 48) return 'fog'; // Fog
  if (code >= 51 && code <= 67) return 'rain'; // Drizzle/Rain
  if (code >= 71 && code <= 77) return 'snow'; // Snow
  if (code >= 80 && code <= 82) return 'rain'; // Showers
  if (code >= 95) return 'storm'; // Thunderstorm
  return 'cloud';
};