// api info
import {API_KEY} from "./apiKey.js";
const apiKey = API_KEY;
const apiUrl = ("https://api.openweathermap.org/data/2.5/weather?");
// search form selectors
const searchForm = document.querySelector(".search");
const searchText = document.querySelector("#search-text-box");
// text element selectors
const cityNameText = document.querySelector(".city-name");
const primaryTemperature = document.querySelector(".primary-temperature");
const feelsLikeTemperature = document.querySelector(".feels-like-temperature");
const highTemperature = document.querySelector(".high-temperature");
const lowTemperature = document.querySelector(".low-temperature");
const weatherTypeText = document.querySelector(".weather-type-text");
const humidityText = document.querySelector(".humidity-text");
const windText = document.querySelector(".wind-speed-text");
const metricButton = document.querySelector("input[value='metric']");
const imperialButton = document.querySelector("input[value='imperial']");
// data measurement system
let unitType = "metric";
// longitude and latitude of location
let longitude, latitude;
// location var if location not in api call
let countryString = "";
let weatherData;
let place;
// search form submit listener
searchForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (metricButton.checked) {
        unitType = "metric";
    } else {
        unitType = "imperial";
    }
    weatherData = await getWeatherData(longitude, latitude);
    try {
        countryString = searchText.value;
        loadDataToDOM(weatherData, unitType, place);
    } catch (e) {
        alert("Please select location using the drop down menu.");
    }
    addWeatherToLocalStorage(longitude, latitude, unitType);
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
    // if reference does not exist, load data for toronto, ON, Canada as default
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

        /*let address = "";
        if (place.address_components) {
            address = [
                (place.address_components[0] && place.address_components[0].short_name || ''),
                (place.address_components[1] && place.address_components[1].short_name || ''),
                (place.address_components[2] && place.address_components[2].short_name || '')
            ].join(' ');
        }*/
        /*********************************************************************/
        /* var address contain your autocomplete address *********************/
        /* place.geometry.location.lat() && place.geometry.location.lat() ****/
        /* will be used for current address latitude and longitude************/
        /*********************************************************************/
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
        primaryTemperature.innerHTML = `${formatNumber(weatherData.main.temp)}&deg;C`;
        feelsLikeTemperature.innerHTML = `Feels Like: ${formatNumber(weatherData.main.feels_like)}&deg;C`
        highTemperature.innerHTML = `High: ${formatNumber(weatherData.main.temp_max)}&deg;C`;
        lowTemperature.innerHTML = `Low: ${formatNumber(weatherData.main.temp_min)}&deg;C`;
        windText.innerHTML = `${formatNumber(weatherData.wind.speed)} km/h`;
    } else {
        primaryTemperature.innerHTML = `${formatNumber(weatherData.main.temp)}&deg;F`;
        feelsLikeTemperature.innerHTML = `Feels Like: ${formatNumber(weatherData.main.feels_like)}&deg;F`;
        highTemperature.innerHTML = `High: ${formatNumber(weatherData.main.temp_max)}&deg;F`;
        lowTemperature.innerHTML = `Low: ${formatNumber(weatherData.main.temp_min)}&deg;F`;
        windText.innerHTML = `${formatNumber(weatherData.wind.speed)} mi/h`;
    }
    cityNameText.innerHTML = `${place.formatted_address}`;
    weatherTypeText.textContent = formatString(weatherData.weather[0].description);
    humidityText.innerHTML = `${weatherData.main.humidity}%`;
}
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
function formatNumber(temp) {
    // rounds number to one decimal place
    // if decimal is 0, doesn't show
    return Math.round(temp * 10) / 10;
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
