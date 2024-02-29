// api info
import {API_KEY} from "./apiKey.js";
const apiKey = API_KEY;
const apiUrl = ("https://api.openweathermap.org/data/2.5/weather?");
// search form selectors
const searchForm = document.querySelector(".search");
// text element selectors
const cityNameText = document.querySelector(".city-name");
const primaryTemperature = document.querySelector(".primary-temperature");
const feelsLikeTemperature = document.querySelector(".feels-like-temperature");
const highTemperature = document.querySelector(".high-temperature");
const lowTemperature = document.querySelector(".low-temperature");
const weatherTypeText = document.querySelector(".weather-type-text");
const humidityText = document.querySelector(".humidity-text");
const windText = document.querySelector(".wind-speed-text");
const weatherIcon = document.querySelector("#weather-icon");
const metricButton = document.querySelector("input[value='metric']");
const imperialButton = document.querySelector("input[value='imperial']");
const sunriseText = document.querySelector(".sunrise-text");
const sunsetText = document.querySelector(".sunset-text");
const lastUpdatedText = document.querySelector(".last-updated");
const visibilityText = document.querySelector(".visibility-text");
const precipitationText = document.querySelector(".precipitation-text");
// data measurement system
let unitType = "metric";
// longitude and latitude of location
let longitude, latitude;
let weatherData;
// google place api
let place;
// search form submit listener
searchForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    weatherData = await getWeatherData(longitude, latitude);
    if (place.place_id !== undefined) {
        loadDataToDOM(weatherData, unitType, place);
        addWeatherToLocalStorage(longitude, latitude, unitType);
    } else {
        alert("Please select location using the drop down menu.");
    }
});
// when user clicks on a temperature unit button
// change units for all temperature values
metricButton.addEventListener("click", async function () {
    if (metricButton.checked && unitType === "imperial") {
        unitType = "metric";
        weatherData = await getWeatherData(longitude, latitude);
        loadDataToDOM(weatherData, unitType, place);
    }
});
imperialButton.addEventListener("click", async function () {
    if (imperialButton.checked && unitType === "metric") {
        unitType = "imperial";
        weatherData = await getWeatherData(longitude, latitude);
        loadDataToDOM(weatherData, unitType, place);
    }
});
// initializes Google Maps geocoding function
window.addEventListener("DOMContentLoaded", initialize);
// loads previous city's weather if page is reset
window.addEventListener("DOMContentLoaded", async function () {
    // if local storage reference does not exist, load data for toronto, ON, Canada as default
    if (getWeatherDataFromLocalStorage() === null) {
        // Coordinates for Toronto, ON, Canada
        longitude = -79.3839;
        latitude = 43.6535;
        place = {
            formatted_address: "Toronto, ON, Canada"
        };
        weatherData = await getWeatherData(longitude, latitude);
        // checks metric radio button, default unit type
        metricButton.checked = true;
        loadDataToDOM(weatherData, unitType, place);
    } else {
        // parse json from local storage
        const data = JSON.parse(getWeatherDataFromLocalStorage());
        weatherData = await getWeatherData(data.longitude, data.latitude);
        // assigns all required variables from local storage
        unitType = data.unitType;
        longitude = data.longitude;
        latitude = data.latitude;
        place = data.place;
        // checks correct radio button based on unit
        if (unitType === "imperial") {
            imperialButton.checked = true;
        } else {
            metricButton.checked = true;
        }
        loadDataToDOM(weatherData, unitType, place);
    }
});
// gets latitude and longitude of place
// uses google autocomplete
function initialize() {
    const address = (document.getElementById("search-text-box"));
    const autocomplete = new google.maps.places.Autocomplete(address);
    autocomplete.setTypes(["geocode"]);
    google.maps.event.addListener(autocomplete, 'place_changed', function () {
        place = autocomplete.getPlace();
        if (!place.geometry) {
            return;
        }
        latitude = place.geometry.location.lat();
        longitude = place.geometry.location.lng();
    });
}
// get weather data from api
// returns object
async function getWeatherData(longitude, latitude) {
    const response = await fetch(`${apiUrl}units=${unitType}&lon=${longitude}&lat=${latitude}&appid=${apiKey}`);
    return await response.json();
}
function loadDataToDOM(weatherData, unitType, place) {
    if (unitType === "metric") {
        primaryTemperature.innerHTML = `${formatNumber(weatherData.main.temp, 1)}&deg;C`;
        feelsLikeTemperature.innerHTML = `Feels Like: ${formatNumber(weatherData.main.feels_like, 1)}&deg;C`
        highTemperature.innerHTML = `High: ${formatNumber(weatherData.main.temp_max, 1)}&deg;C`;
        lowTemperature.innerHTML = `Low: ${formatNumber(weatherData.main.temp_min, 1)}&deg;C`;
        windText.innerHTML = `${formatNumber(weatherData.wind.speed, 1)} km/h`;
        visibilityText.innerHTML = `${formatNumber(MToKm(weatherData.visibility), 1)}km`;
        precipitationText.innerHTML = `${formatNumber(getPrecipitation(weatherData), 2)}mm`;
    } else {
        primaryTemperature.innerHTML = `${formatNumber(weatherData.main.temp, 1)}&deg;F`;
        feelsLikeTemperature.innerHTML = `Feels Like: ${formatNumber(weatherData.main.feels_like, 1)}&deg;F`;
        highTemperature.innerHTML = `High: ${formatNumber(weatherData.main.temp_max, 1)}&deg;F`;
        lowTemperature.innerHTML = `Low: ${formatNumber(weatherData.main.temp_min, 1)}&deg;F`;
        windText.innerHTML = `${formatNumber(weatherData.wind.speed, 1)} mi/h`;
        visibilityText.innerHTML = `${formatNumber(MToMi(weatherData.visibility), 2)}mi`;
        precipitationText.innerHTML = `${formatNumber(MMToInches(getPrecipitation(weatherData), 2))}in`;
    }
    cityNameText.innerHTML = `${place.formatted_address}`;
    weatherTypeText.textContent = formatString(weatherData.weather[0].description);
    weatherIcon.setAttribute("src", `https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`)
    humidityText.innerHTML = `${weatherData.main.humidity}%`;
    sunsetText.innerHTML = getTime(weatherData.sys.sunset, weatherData.timezone);
    sunriseText.innerHTML = getTime(weatherData.sys.sunrise, weatherData.timezone);
    lastUpdatedText.innerHTML = `Data Last Updated: ${getClientTime(weatherData.dt)}`;
}

// capitalizes first letter of each word
function formatString(string) {
    string = string.trim();
    if (string.indexOf(" ") !== -1) {
        // array of all words
        let array = string.split(" ");
        let result = "";
        // loop through each word in array
        // capitalize first letter
        for (let i= 0; i < array.length; i++) {
            let fixedString = array[i].charAt(0).toUpperCase() + array[i].slice(1);
            result += `${fixedString} `;
        }
        return result;
    } else {
        // capitalize first letter of the only word
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
}

// formats decimal number to specified number of decimals
function formatNumber(temp, decimalPlaces) {
    let multiple = 1;
    for (let i = 0; i < decimalPlaces; i++) {
        multiple *= 10;
    }
    return Math.round(temp * multiple) / multiple;
}

// formats time to xx:xx
function formatTime(hours, minutes) {
    if (hours < 10) {
        hours = `0${hours}`;
    }
    if (minutes < 10) {
        minutes = `0${minutes}`;
    }
    return `${hours}:${minutes}`
}
// commit required data to local storage
function addWeatherToLocalStorage() {
    const weatherObj = {
        longitude: longitude,
        latitude: latitude,
        place: place,
        unitType: unitType
    }
    localStorage.setItem("weather", JSON.stringify(weatherObj));
}
function getWeatherDataFromLocalStorage() {
    // get obj from local storage
    return localStorage.getItem("weather");
}

// takes unix time and timezone offset in seconds
// formats to xx:xx
function getTime(unixTime, timezoneSeconds) {
    const dateObj = new Date((unixTime * 1000) + getRelativeOffset(timezoneSeconds));
    return formatTime(dateObj.getHours(), dateObj.getMinutes());
}

// get timezone difference between client and weather data location
function getRelativeOffset(timezoneSeconds) {
    // offset in milliseconds from clients timezone
    const clientUTCOffset = new Date(Date.now()).getTimezoneOffset() * 60000;
    // offset in milliseconds from weather location timezone
    const locationUTCOffset = timezoneSeconds * 1000;
    return clientUTCOffset + locationUTCOffset;
}

// returns local time of user
// xx:xx format
function getClientTime(unixTime) {
    const dateObj = new Date((unixTime * 1000) + (new Date(Date.now()).getTimezoneOffset()));
    return formatTime(dateObj.getHours(), dateObj.getMinutes());
}

function MMToInches(mm) {
    return mm / 25.4;
}

function MToKm(meters) {
    return meters / 1000;
}

// returns distance in miles
function MToMi(meters) {
    return meters / 1609;
}

// returns precipitation in mm
// rain or snow
function getPrecipitation(weatherData) {
    let rainMM, snowMM;
    // if rain var does not exist default to undefined
    try {
        rainMM = weatherData.rain["1h"];
    } catch (e) {
        rainMM = undefined;
    }
    // if snow var does not exist default to undefined
    try {
        snowMM = weatherData.snow["1h"];
    } catch (e) {
        snowMM = undefined;
    }
    if (rainMM !== undefined) {
        return rainMM;
    } else if (snowMM !== undefined) {
        return snowMM;
    } else {
        return 0;
    }
}
