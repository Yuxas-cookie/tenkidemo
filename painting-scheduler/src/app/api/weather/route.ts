import { NextRequest } from "next/server";
import { weatherScenarios } from "@/lib/data/weather-scenarios";
import { WeatherScenario } from "@/lib/types";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get("mode") || "demo";
  const scenario = (searchParams.get("scenario") || "mid_rain") as WeatherScenario;

  if (mode === "demo") {
    const forecast = weatherScenarios[scenario];
    if (!forecast) {
      return Response.json({ error: "Invalid scenario" }, { status: 400 });
    }
    return Response.json(forecast);
  }

  // Real mode: use OpenWeatherMap
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    // Fallback to demo data
    return Response.json({
      ...weatherScenarios[scenario],
      _warning: "OpenWeatherMap API key not configured. Using demo data.",
    });
  }

  try {
    const lat = 34.5198; // Takaishi, Osaka
    const lon = 135.4405;
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast/daily?lat=${lat}&lon=${lon}&cnt=16&appid=${apiKey}&units=metric&lang=ja`
    );

    if (!res.ok) {
      throw new Error(`OpenWeatherMap API error: ${res.status}`);
    }

    const data = await res.json();
    const days = data.list.map(
      (day: {
        dt: number;
        weather: { main: string }[];
        temp: { max: number; min: number };
        humidity: number;
        speed: number;
        rain?: number;
      }) => {
        const date = new Date(day.dt * 1000).toISOString().split("T")[0];
        const mainWeather = day.weather[0].main.toLowerCase();
        const weather = mainWeather.includes("rain")
          ? day.rain && day.rain > 10
            ? "heavy_rain"
            : "rainy"
          : mainWeather.includes("cloud")
            ? "cloudy"
            : "sunny";

        return {
          date,
          weather,
          tempMax: Math.round(day.temp.max),
          tempMin: Math.round(day.temp.min),
          humidity: day.humidity,
          windSpeed: day.speed,
          precipitation: day.rain || 0,
          canWork:
            day.temp.max >= 5 &&
            day.humidity < 85 &&
            !["rainy", "heavy_rain", "storm"].includes(weather),
        };
      }
    );

    return Response.json({
      location: "大阪府高石市",
      days,
      fetchedAt: new Date().toISOString(),
      isDemo: false,
    });
  } catch {
    // Fallback to demo data on error
    return Response.json({
      ...weatherScenarios[scenario],
      _warning: "Failed to fetch real weather data. Using demo data.",
    });
  }
}
