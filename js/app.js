// api info
import {API_KEY} from "./apiKey.js";
const apiKey = API_KEY;
const apiUrl = ("https://api.openweathermap.org/data/2.5/weather?");
// search form selectors
const searchButton = document.querySelector(".submit-button");
const searchText = document.querySelector("#search-text-box");
// text element selectors
const cityNameText = document.querySelector(".city-name");
const primaryTemperature = document.querySelector(".primary-temperature");
const feelsLikeTemperature = document.querySelector(".feels-like-temperature");
const highTemperature = document.querySelector(".high-temperature");
const lowTemperature = document.querySelector(".low-temperature");
const weatherTypeText = document.querySelector(".weather-type-text");
const humidityText = document.querySelector(".humidity-text");
const temperatureOption = document.querySelectorAll(".temperature-type-option");
const celsiusButton = document.querySelector("input[value='celsius']")
// data measurement system
let unitType = "metric";
// longitude and latitude of location
let longitude, latitude;
// location var if location not in api call
let countryString = "";
let weatherData;
let place;
// search button click listener
searchButton.addEventListener("click", async (e) => {
    e.preventDefault();
    if (celsiusButton.checked) {
        unitType = "metric";
    } else {
        unitType = "imperial";
    }
    weatherData = await getWeatherData(longitude, latitude);
    try {
        countryString = searchText.value;
        loadDataToDOM(weatherData, unitType, countryString);
    } catch (e) {
        alert("Please select location using the drop down menu.");
    }
    console.log(weatherData);
});
// when user clicks on a temperature unit button
// change units for all temperature values
temperatureOption.forEach( (button) => {
    button.addEventListener("click", async (e) => {
        if (celsiusButton.checked && unitType === "metric") {
        //     correct button and unit selected, do nothing
        } else if (celsiusButton.checked && unitType === "imperial") {
            unitType = "metric";
            loadDataToDOM(weatherData, unitType, countryString);
        } else if (!celsiusButton.checked && unitType === "imperial") {
        //     correct button and unit selected, nothing
        } else if (!celsiusButton.checked && unitType === "metric") {
            unitType = "imperial";
            loadDataToDOM(weatherData, unitType, countryString);
        }
    });
});
// initializes Google Maps geocoding function
window.addEventListener("DOMContentLoaded", initialize);
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

        let address = "";
        if (place.address_components) {
            address = [
                (place.address_components[0] && place.address_components[0].short_name || ''),
                (place.address_components[1] && place.address_components[1].short_name || ''),
                (place.address_components[2] && place.address_components[2].short_name || '')
            ].join(' ');
        }
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
function loadDataToDOM(weatherData, unitType, countryString) {
    if (unitType === "metric") {
        primaryTemperature.innerHTML = `${formatNumber(weatherData.main.temp)}&deg;C`;
        feelsLikeTemperature.innerHTML = `Feels Like: ${formatNumber(weatherData.main.feels_like)}&deg;C`
        highTemperature.innerHTML = `High: ${formatNumber(weatherData.main.temp_max)}&deg;C`;
        lowTemperature.innerHTML = `Low: ${formatNumber(weatherData.main.temp_min)}&deg;C`;
    } else {
        primaryTemperature.innerHTML = `${formatNumber(weatherData.main.temp)}&deg;F`;
        feelsLikeTemperature.innerHTML = `Feels Like: ${formatNumber(weatherData.main.feels_like)}&deg;F`;
        highTemperature.innerHTML = `High: ${formatNumber(weatherData.main.temp_max)}&deg;F`;
        lowTemperature.innerHTML = `Low: ${formatNumber(weatherData.main.temp_min)}&deg;F`;
    }
    cityNameText.innerHTML = `${countryString}`;
    weatherTypeText.textContent = formatString(weatherData.weather[0].description);
    humidityText.innerHTML = `${weatherData.main.humidity}%`;
}
function formatString(string) {
    string = string.trim();
    if (string.indexOf(" ") !== -1) {
        let array = string.split(" ");
        let result = "";
        for (let i= 0; i < array.length; i++) {
            let fixedString = array[i].charAt(0).toUpperCase() + array[i].slice(1);
            result += `${fixedString} `;
        }
        return result;
    } else {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
}
function formatNumber(temp) {
    // rounds number to one decimal place
    // if decimal is 0, doesn't show
    return Math.round(temp * 10) / 10;
}
