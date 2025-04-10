const locations = {
    "Mason City": { lat: 43.150626, lon: -93.232637 },
    Manly: { lat: 43.30777783333333, lon: -93.9808 },
    Howell: { lat: 42.633055, lon: -83.933971 },
    Omaha: { lat: 41.281406, lon: -96.213680 },
    Springfield: { lat: 37.2153, lon: -93.2982 },
    Groton: { lat: 41.3747, lon: -72.0691 },
    Mitaka: { lat: 35.6838, lon: 139.5594 },
    Shizuoka: { lat: 35.0571817, lon: 138.0814498 },
    Kobe: { lat: 34.6913, lon: 135.183 },
    "Lino Lakes": { lat: 45.1395615, lon: -93.0291282 }
};

// Map Open-Meteo weather codes to icons
const weatherIcons = {
    0: "☀️", // Clear sky
    1: "🌤️", 2: "🌤️", 3: "⛅", // Partly cloudy
    45: "🌫️", 48: "🌫️", // Fog
    51: "🌧️", 53: "🌧️", 55: "🌧️", 61: "🌧️", 63: "🌧️", 65: "🌧️", 67: "🌧️", // Rain/Drizzle
    71: "❄️", 73: "❄️", 75: "❄️", 77: "❄️", // Snow
    80: "🌦️", 81: "🌦️", 82: "🌦️", // Rain showers
    95: "⛈️", 96: "⛈️", 99: "⛈️" // Thunderstorm
};

const windIcons = {
    N: "⬆️", NE: "↗️", E: "➡️", SE: "↘️", S: "⬇️", SW: "↙️", W: "⬅️", NW: "↖️"
};

// Convert degrees to cardinal direction
function getWindDirection(degrees) {
    if (degrees >= 337.5 || degrees < 22.5) return "N";
    if (degrees >= 22.5 && degrees < 67.5) return "NE";
    if (degrees >= 67.5 && degrees < 112.5) return "E";
    if (degrees >= 112.5 && degrees < 157.5) return "SE";
    if (degrees >= 157.5 && degrees < 202.5) return "S";
    if (degrees >= 202.5 && degrees < 247.5) return "SW";
    if (degrees >= 247.5 && degrees < 292.5) return "W";
    if (degrees >= 292.5 && degrees < 337.5) return "NW";
    return undefined;
}

// API call to get weather data
async function fetchWeather(locationName, lat, lon) {
    const useMetric = localStorage.getItem("useMetric") === "true";
    const showExtendedForecast = localStorage.getItem("showExtendedForecast") === "true";
    const tempUnit = useMetric ? 'celsius' : 'fahrenheit';
    const windSpeedUnit = useMetric ? "kmh" : "mph";
    const daysToShow = showExtendedForecast ? 7 : 3;

    const baseUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
    const fieldsToReturn = `&daily=temperature_2m_max,temperature_2m_min,weathercode,sunrise,sunset,precipitation_probability_mean`;
    const apiOptions = `&temperature_unit=${tempUnit}&windspeed_unit=${windSpeedUnit}&timezone=auto&forecast_days=${daysToShow}`;
    const url = baseUrl + fieldsToReturn + apiOptions;

    try {
        const response = await fetch(url);
        const data = await response.json();
        // console.log(data); /* Debug code */

        const weatherIcon = weatherIcons[data.current_weather.weathercode] || "❓";
        const currentTemp = data.current_weather.temperature;
        const sunriseTime = new Date(data.daily.sunrise[0]).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
        const sunsetTime = new Date(data.daily.sunset[0]).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
        const windDirection = getWindDirection(data.current_weather.winddirection);
        const windDirectionIcon = windIcons[windDirection] || "❓";
        const windSpeed = data.current_weather.windspeed;
        const windUnits = useMetric ? data.current_weather_units["windspeed"] : windSpeedUnit;

        let forecastTable = `<table><tr><th>Day</th><th>High</th><th>Low</th><th>🌧️</th></tr>`;
        data.daily.time.forEach((date, index) => {
            const dayName = new Date(date + "T00:00:00").toLocaleDateString('en-US', { weekday: 'short' });
            const forecastIcon = weatherIcons[data.daily.weathercode[index]] || "❓";

            forecastTable += `<tr>
                <td>${forecastIcon} ${dayName}</td>
                <td>${data.daily.temperature_2m_max[index]}°${useMetric ? 'C' : 'F'}</td>
                <td>${data.daily.temperature_2m_min[index]}°${useMetric ? 'C' : 'F'}</td>
                <td>${data.daily.precipitation_probability_mean[index]}%</td>`;
            forecastTable += `</tr>`;
        });
        forecastTable += `</table>`;

        document.getElementById(locationName).innerHTML = `
            <strong>${weatherIcon} ${currentTemp}°${useMetric ? 'C' : 'F'} in ${locationName}</strong>
            <hr>
            <div><small>🌅 ${sunriseTime} 🌇 ${sunsetTime} ${windDirectionIcon} ${windSpeed} ${windUnits}</small></div>
            <hr>
            ${forecastTable}
        `;
    } catch (error) {
        document.getElementById(locationName).innerText = 'Error fetching data';
    }
}

// Loop through locations and call api to get weather data
function refreshList() {
    Object.keys(locations).forEach(async location => {
        await fetchWeather(location, locations[location].lat, locations[location].lon);
    });
}

// Toggle temperature unit button click
document.getElementById("toggle-unit").addEventListener("click", () => {
    const useMetric = localStorage.getItem("useMetric") === "true";
    localStorage.setItem("useMetric", !useMetric);
    document.getElementById("toggle-unit").innerText = useMetric ? "C°" : "F°";
    refreshList();
});

// Toggle extended forecast button click
document.getElementById("toggle-forecast").addEventListener("click", () => {
    const showExtendedForecast = localStorage.getItem("showExtendedForecast") === "true";
    localStorage.setItem("showExtendedForecast", !showExtendedForecast);
    document.getElementById("toggle-forecast").innerText = showExtendedForecast ? "7 Day Forecast" : "3 Day Forecast";
    refreshList();
});

// Initial page load
document.getElementById("toggle-unit").innerText = localStorage.getItem("useMetric") === "true" ? "F°" : "C°";
document.getElementById("toggle-forecast").innerText = localStorage.getItem("showExtendedForecast") === "true" ? "3 Day Forecast" : "7 Day Forecast";
refreshList();