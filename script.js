const locations = {
    "Mason City": { lat: 43.150626, lon: -93.232637 },
    Manly: { lat: 43.30777783333333, lon: -93.9808 },
    Howell: { lat: 42.633055, lon: -83.933971 },
    Omaha: { lat: 41.281406, lon: -96.213680 },
    Springfield: { lat: 37.2153, lon: -93.2982 },
    Groton: { lat: 41.3747, lon: -72.0691 },
    Mitaka: { lat: 35.6838, lon: 139.5594 },
    Shizuoka: { lat: 35.0571817, lon: 138.0814498 }
};

// Map Open-Meteo weather codes to icons
const weatherIcons = {
    0: "☀️", // Clear sky
    1: "🌤️", 2: "🌤️", 3: "⛅", // Partly cloudy
    45: "🌫️", 48: "🌫️", // Fog
    51: "🌧️", 53: "🌧️", 55: "🌧️", 61: "🌧️", 63: "🌧️", 65: "🌧️", 67: "🌧️", // Rain/Drizzle
    71: "❄️", 73: "❄️", 75: "❄️", 77: "❄️", // Snow
    80: "🌦️", 81: "🌦️", 82: "🌦️", // Rain showers
    95: "⛈️", 96: "⛈️", 99: "⛈️", // Thunderstorm
    sunrise: "🌅", // Sunrise
    sunset: "🌇"  // Sunset
};

let useFahrenheit = true;
let showExtendedForecast = false;

async function fetchWeather(locationName, lat, lon) {
    const unit = useFahrenheit ? 'fahrenheit' : 'celsius';
    const daysToShow = showExtendedForecast ? 7 : 3;
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode,sunrise,sunset&temperature_unit=${unit}&timezone=auto&forecast_days=${daysToShow}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        // Ensure feels-like temperature is properly retrieved
        const currentTemp = data.current_weather.temperature;
        const weatherCode = data.current_weather.weathercode;
        const weatherIcon = weatherIcons[weatherCode] || "❓";

        // Convert forecast dates to day names and format as a table
        let forecastTable = `<table><tr><th>Day</th><th>High</th><th>Low</th></tr>`; 
        
        data.daily.time.forEach((date, index) => {
            const dayName = new Date(date + "T00:00:00").toLocaleDateString('en-US', { weekday: 'short' });
            const forecastIcon = weatherIcons[data.daily.weathercode[index]] || "❓";

            forecastTable += `<tr>
                <td>${forecastIcon} ${dayName}</td>
                <td>${data.daily.temperature_2m_max[index]}°${useFahrenheit ? 'F' : 'C'}</td>
                <td>${data.daily.temperature_2m_min[index]}°${useFahrenheit ? 'F' : 'C'}</td>`;
            forecastTable += `</tr>`;
        });
        forecastTable += `</table>`;

        const sunriseTime = new Date(data.daily.sunrise[0]).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
        const sunsetTime = new Date(data.daily.sunset[0]).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
        const sunriseIcon = weatherIcons["sunrise"];
        const sunsetIcon = weatherIcons["sunset"];

        document.getElementById(locationName).innerHTML = `
            <strong>${weatherIcon} ${currentTemp}°${useFahrenheit ? 'F' : 'C'} in ${locationName}</strong>
            <hr>
            <div><small>${sunriseIcon} ${sunriseTime}</small> <small>${sunsetIcon} ${sunsetTime}</small></div>
            <hr>
            ${forecastTable}
        `;
    } catch (error) {
        document.getElementById(locationName).innerText = 'Error fetching data';
    }
}

// Fetch weather for all locations using proper names
Object.keys(locations).forEach(location => {
    fetchWeather(location, locations[location].lat, locations[location].lon);
});

// Toggle temperature unit
document.getElementById("toggle-unit").addEventListener("click", () => {
    useFahrenheit = !useFahrenheit;
    document.getElementById("toggle-unit").innerText = useFahrenheit ? "C°" : "F°";

    // Re-fetch weather data with the new unit
    Object.keys(locations).forEach(location => {
        fetchWeather(location, locations[location].lat, locations[location].lon);
    });
});

// Toggle extended forecast checkbox
document.getElementById("toggle-forecast").addEventListener("click", () => {
    showExtendedForecast = !showExtendedForecast;
    document.getElementById("toggle-forecast").innerText = showExtendedForecast ? "3 Day Forecast" : "7 Day Forecast";
    Object.keys(locations).forEach(location => {
        fetchWeather(location, locations[location].lat, locations[location].lon);
    });
});