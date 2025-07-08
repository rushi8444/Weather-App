// DOM element selectors
const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const userContainer = document.querySelector("[weather-container]");
const grantAccessContainer = document.querySelector(".grant-location-container");
const searchForm = document.querySelector("[data-searchForm]");
const loadingScreem = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector("[data-userInfoContainer]");
const grantAccessBtn = document.querySelector("[data-grantAccess]");
const searchInput = document.querySelector("[data-searchInput]");

// API Key
let API_key = "e6f989a3266ab4cc1fdc3ee9d429f961";

// Tab state
let currentTab = userTab;
currentTab.classList.add("current-tab");
getFromSessionStorage();

// Tab switching events
userTab.addEventListener('click', () => switchTab(userTab));
searchTab.addEventListener("click", () => switchTab(searchTab));

grantAccessBtn.addEventListener("click", getLocation);
searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (searchInput.value === "") return;
    fetchSearchWeatherInfo(searchInput.value);
});

// Tab switching logic
function switchTab(clickedTab) {
    if (clickedTab !== currentTab) {
        currentTab.classList.remove("current-tab");
        currentTab = clickedTab;
        currentTab.classList.add("current-tab");

        if (!searchForm.classList.contains("active")) {
            userInfoContainer.classList.remove("active");
            grantAccessContainer.classList.remove("active");
            searchForm.classList.add("active");
        } else {
            searchForm.classList.remove("active");
            userInfoContainer.classList.remove("active");
            grantAccessContainer.classList.remove("active");
            getFromSessionStorage();
        }
    }
    console.log("tab switching properly");
}

// Check for stored coordinates
function getFromSessionStorage() {
    const localCoordinates = sessionStorage.getItem("user-coordinates");
    userInfoContainer.classList.remove("active");
    searchForm.classList.remove("active");
    loadingScreem.classList.remove("active");
    if (!localCoordinates) {
        grantAccessContainer.classList.add("active");
    } else {
        const coordinates = JSON.parse(localCoordinates);
        fetchUserWeatherInfo(coordinates);
        console.log("got the coordinates");
        console.log(coordinates);
    }
    console.log("getFromSessionStorage");
}

// Fetch weather using coordinates
async function fetchUserWeatherInfo(coordinates) {
    const { lat, lon } = coordinates;
    grantAccessContainer.classList.remove("active");
    loadingScreem.classList.add("active");
    try {
        let response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_key}&units=metric`);
        let data = await response.json();
        loadingScreem.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    } catch (error) {
        loadingScreem.classList.remove("active");
        alert("Failed to fetch weather data.");
    }
}

// Fetch weather using city name
async function fetchSearchWeatherInfo(city) {
    loadingScreem.classList.add("active");
    userInfoContainer.classList.remove("active");
    grantAccessContainer.classList.remove("active");
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_key}&units=metric`);
        const data = await response.json();
        loadingScreem.classList.remove("active");
        if (data?.cod === "404") {
            alert("City not found!");
            return;
        }
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    } catch (error) {
        loadingScreem.classList.remove("active");
        alert("Something went wrong while fetching weather data.");
    }
}

// Render weather info to UI
function renderWeatherInfo(data) {
    const cityName = document.querySelector("[data-cityName]");
    const countryIcon = document.querySelector("[data-countryIcon]");
    const desc = document.querySelector("[data-weatherDescription]");
    const weatherIcon = document.querySelector("[data-weatherIcon]");
    const temp = document.querySelector("[data-temp]");
    const windSpeed = document.querySelector("[data-windSpeed]");
    const humidity = document.querySelector("[data-humidity]");
    const cloud = document.querySelector("[data-cloudiness]");
    cityName.innerText = data?.name;
    countryIcon.src = `https://flagcdn.com/144x108/${data?.sys?.country.toLowerCase()}.png`;
    desc.innerText = data?.weather?.[0]?.description;
    weatherIcon.src = `http://openweathermap.org/img/w/${data?.weather?.[0]?.icon}.png`;
    temp.innerText = `${data?.main?.temp}°C `;
    windSpeed.innerText = `${data?.wind?.speed}m/s`;
    humidity.innerText = `${data?.main?.humidity}%`;
    cloud.innerText = `${data?.clouds?.all}%`;
}

// Geolocation logic
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        alert("browser doesn't support geolocation");
    }
}

function showPosition(position) {
    const userCoordinates = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
    };
    sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
    fetchUserWeatherInfo(userCoordinates);
}
