import { NextRequest } from "next/server";
import { weatherScenarios } from "@/lib/data/weather-scenarios";
import { WeatherScenario, WeatherType } from "@/lib/types";

// WMO Weather Code → アプリ内天気タイプ変換
function wmoCodeToWeatherType(code: number): WeatherType {
  if (code <= 1) return "sunny"; // Clear sky, Mainly clear
  if (code <= 3) return "cloudy"; // Partly cloudy, Overcast
  if (code <= 48) return "cloudy"; // Fog variants
  if (code <= 55) return "rainy"; // Drizzle
  if (code <= 57) return "rainy"; // Freezing drizzle
  if (code <= 61) return "rainy"; // Slight rain
  if (code <= 65) return "heavy_rain"; // Moderate/heavy rain
  if (code <= 67) return "heavy_rain"; // Freezing rain
  if (code <= 77) return "cloudy"; // Snow (treat as cloudy for painting)
  if (code <= 82) return "heavy_rain"; // Rain showers
  if (code <= 86) return "cloudy"; // Snow showers
  if (code >= 95) return "storm"; // Thunderstorm
  return "cloudy";
}

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

  // Real mode: Open-Meteo API（APIキー不要・無料）
  try {
    const lat = 34.5198; // 高石市, 大阪
    const lon = 135.4405;
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max,relative_humidity_2m_max&timezone=Asia%2FTokyo&forecast_days=16`,
      { next: { revalidate: 3600 } } // 1時間キャッシュ
    );

    if (!res.ok) {
      throw new Error(`Open-Meteo API error: ${res.status}`);
    }

    const data = await res.json();
    const daily = data.daily;

    const days = daily.time.map((date: string, i: number) => {
      const weatherCode = daily.weather_code[i];
      const weather = wmoCodeToWeatherType(weatherCode);
      const tempMax = Math.round(daily.temperature_2m_max[i]);
      const humidity = Math.round(daily.relative_humidity_2m_max[i]);
      const precipitation = daily.precipitation_sum[i];

      return {
        date,
        weather,
        tempMax,
        tempMin: Math.round(daily.temperature_2m_min[i]),
        humidity,
        windSpeed: Math.round(daily.wind_speed_10m_max[i] / 3.6 * 10) / 10, // km/h → m/s
        precipitation: Math.round(precipitation * 10) / 10,
        canWork:
          tempMax >= 5 &&
          humidity < 85 &&
          !["rainy", "heavy_rain", "storm"].includes(weather),
      };
    });

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
