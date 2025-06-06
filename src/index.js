import "./style.css";
const rainBg =
  "https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExZmE1OGtrc2ZwNDEyZmpzM21idTBwcm92d2VobGRlaDByaW9saXRmeSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/RgZFvGuI4OxLjuSvRF/giphy.gif";
const sunBg =
  "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExcXM2bzRsYTdwcjhrbGVmNmY4OXR4eTUyaGFzaThzeWUyd2N1OTJkdiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/iYMLPteLsPVZe/giphy.gif";
const cloudsBg =
  "https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExNnk2NzM1N2x5cHk1Z3hkbjdvY28yYXBnd2J4ZHdtOGg5eWRpOWI2ayZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l3V0hSwrWKBGIM2vS/giphy.gif";
const sunsetBg =
  "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExYjlkOXJ3cG83M3RueWVnOXRvYnE1cmZ3Z25nMjQxNWdtdnliZGhyeCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/J5A1a5C0j1bQuteCtq/giphy.gif";
const snowBg =
  "https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExaG16ajBsZ2Y0ZTgweHpjdm5ucjh4YnU2ODBwYmoxdzJldGR6YTN4MCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/2ysWDkcGoleLTXaxk5/giphy.gif";
const nightBg =
  "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExZ2ljcmdoZDhsM2VzODQ2a2d2NmR4Z2ZjMmR2dXpraHlmMTV2Y2k3aiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/6705G9I9sUcNCaJF10/giphy.gif";

async function getLocation() {
  let position;
  try {
    position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          console.log("Geo success");
          resolve(pos);
        },
        (err) => {
          console.log("Geo fail");
          console.log("Error code:", err.code); // 1=permission denied, 2=position unavailable, 3=timeout
          console.log("Error message:", err.message);
          reject(err);
        },
        { timeout: 10000 },
      );
    });

    // These run *after* position is resolved:
    console.log("Success, position", position.coords);
    const lat = position.coords.latitude;
    const long = position.coords.longitude;
    const locationString = `${lat},${long}`;
    let weatherData = await getWeather(locationString);
    appendMainWeatherData(weatherData, 0);
    appendMainDetailData(weatherData);
    getFutureDisplay(weatherData);
  } catch (error) {
    console.log("No location available for ", position, ": ", error.message);
  }
}

async function getWeather(location) {
  try {
    let response = await fetch(
      `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${location}?key=XYYPKNCVA3BUDH5C2JF3DT68M`,
    );
    let data = await response.json();
    return data;
  } catch (error) {
    console.log("Weather fetch failed: ", error);
  }
}

function appendMainWeatherData(data, day) {
  const mainTemp = document.getElementById("main-temp");
  const mainHigh = document.getElementById("main-high");
  const mainLow = document.getElementById("main-low");
  mainTemp.textContent = `${data.days[day].temp}°`;
  mainHigh.textContent = `${data.days[day].tempmax}°`;
  mainLow.textContent = `${data.days[day].tempmin}°`;
  setWeatherType(data);
  console.log(data.days[day]);
}

function appendMainDetailData(data) {
  const rainChance = document.getElementById("rain-chance");
  const windSpeed = document.getElementById("wind-speed");
  const sunriseTime = document.getElementById("sunrise-time");
  const sunsetTime = document.getElementById("sunset-time");
  const atmosphericPressure = document.getElementById("atmospheric-pressure");
  const uvIndex = document.getElementById("uv-index");
  const humidity = document.getElementById("humidity");
  const gusts = document.getElementById("gusts");
  const description = document.getElementById("main-description");
  const icon = document.getElementById("main-icon");
  rainChance.textContent = `${data.days[0].precipprob}%`;
  windSpeed.textContent = data.days[0].windspeed;
  sunriseTime.textContent = data.days[0].sunrise;
  sunsetTime.textContent = data.days[0].sunset;
  atmosphericPressure.textContent = data.days[0].pressure;
  uvIndex.textContent = data.days[0].uvindex;
  humidity.textContent = data.days[0].humidity;
  gusts.textContent = data.days[0].windgust;
  description.textContent = data.days[0].description;
}

function appendIcon(type, icon) {
  if (type === "snow") {
    icon.src = snowIcon.src;
  } else if (type === "clouds") {
    icon.src = cloudsIcon.src;
  } else if (type === "sun") {
    icon.src = sunIcon.src;
  } else if (type === "storm") {
    icon.src = stormIcon.src;
  } else if (type === "night") {
    icon.src = nightIcon.src;
  } else if (type === "solarchange") {
    icon.src = sunsetIcon.src;
  }
}

getLocation();

let searchString;
const searchBar = document.getElementById("search-bar");
searchBar.addEventListener("keydown", async (e) => {
  if (e.key === "Enter" || event.code === "Enter" || event.keyCode === 13) {
    searchString = searchBar.value;
    try {
      let weatherData = await getWeather(searchString);
      appendMainWeatherData(weatherData, 0);
      appendMainDetailData(weatherData);
      setWeatherType(weatherData);
    } catch (error) {
      console.log(
        "No location available for ",
        searchString,
        ": ",
        error.message,
      );
    }
  }
});
const searchBtn = document.getElementById("search-btn");
searchBtn.addEventListener("click", async () => {
  searchString = searchBar.value;
  try {
    let weatherData = await getWeather(searchString);
    appendMainWeatherData(weatherData, 0);
    appendMainDetailData(weatherData);
    setWeatherType(weatherData);
  } catch (error) {
    console.log(
      "No location available for ",
      searchString,
      ": ",
      error.message,
    );
  }
});

const futureContainer = document.getElementById("future-container");
const days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

async function getFutureDisplay(data) {
  for (let i = 0; i < data.days.length; i++) {
    // Ensure date parsing is consistent
    const futureDate = new Date(`${data.days[i].datetime}T00:00:00`);
    appendFutureWeatherData(data, futureDate, i);
  }
}

function appendFutureWeatherData(data, date, index) {
  const dayContainer = document.createElement("div");
  dayContainer.classList.add("date-container");

  const nameOfDay = days[date.getDay()];
  const nameContainer = document.createElement("p");
  nameContainer.textContent = nameOfDay;
  nameContainer.classList.add("name-of-day");

  const dataContainer = document.createElement("div");
  dataContainer.classList.add("future-data");

  const futureMainTemp = document.createElement("span");
  futureMainTemp.textContent = `${data.days[index].temp}°`;
  futureMainTemp.classList.add("pontano-sans-temp");

  const highLowContainer = document.createElement("div");
  highLowContainer.classList.add("future-high-low-container");
  const futureHigh = document.createElement("span");
  futureHigh.textContent = `${data.days[index].tempmax}°`;
  futureHigh.classList.add("pontano-sans-temp");

  const futureLow = document.createElement("span");
  futureLow.textContent = `${data.days[index].tempmin}°`;
  futureLow.classList.add("pontano-sans-temp");

  highLowContainer.append(futureHigh, futureLow);
  dataContainer.append(futureMainTemp, highLowContainer);
  dayContainer.append(nameContainer, dataContainer);
  futureContainer.appendChild(dayContainer);
}

function setWeatherType(data) {
  const today = data.days[0];
  const temp = today.temp;
  const precip = today.precipprob;
  const cloudCover = today.cloudcover;

  const sunriseTime = new Date(today.sunriseEpoch * 1000);
  const sunsetTime = new Date(today.sunsetEpoch * 1000);

  const now = new Date(); // current local time
  // convert local now to UTC
  const nowUtc = new Date(now.getTime() + now.getTimezoneOffset() * 60000);

  console.log("now UTC:", nowUtc.toISOString());
  console.log("sunrise:", sunriseTime.toISOString());
  console.log("sunset:", sunsetTime.toISOString());

  const halfHour = 30 * 60 * 1000;
  const nearSunrise = Math.abs(nowUtc - sunriseTime) <= halfHour;
  const nearSunset = Math.abs(nowUtc - sunsetTime) <= halfHour;

  let weatherType;
  if (nearSunrise || nearSunset) {
    weatherType = "solarchange";
  } else if (temp <= 32) {
    weatherType = "snow";
  } else if (precip > 50 && temp > 32) {
    weatherType = "storm";
  } else if (cloudCover >= 80 || temp <= 60) {
    weatherType = "clouds";
  } else {
    weatherType = "sun";
  }

  const isNight = nowUtc < sunriseTime || nowUtc > sunsetTime;

  console.log("weatherType:", weatherType);
  console.log("isNight:", isNight);

  changeTheme(weatherType, temp, isNight);
}

const background = document.querySelector("body");
const gif = document.createElement("img");
const gifContainer = document.getElementById("right-main-container");

function changeTheme(weatherType, temp, isNight) {
  if (weatherType === "snow") {
    background.style.backgroundColor = "lightskyblue";
    gif.src = snowBg;
    document.documentElement.style.setProperty("--header-color", "royalblue");
    document.documentElement.style.setProperty("--heat-value", "#FFDDE2");
    document.documentElement.style.setProperty("--cool-value", "#B0E0E6");
  } else if (weatherType === "clouds") {
    background.style.backgroundColor = "lightskyblue";
    gif.src = cloudsBg;
    document.documentElement.style.setProperty("--header-color", "aliceblue");
    document.documentElement.style.setProperty("--heat-value", "#FFDDE2");
    document.documentElement.style.setProperty("--cool-value", "#D0FFF9");
  } else if (weatherType === "sun") {
    background.style.backgroundColor = "deepskyblue";
    gif.src = sunBg;
    document.documentElement.style.setProperty("--header-color", "burlywood");
    document.documentElement.style.setProperty("--heat-value", "coral");
    document.documentElement.style.setProperty("--cool-value", "sienna");
  } else if (weatherType === "storm") {
    background.style.backgroundColor = "royalblue";
    gif.src = rainBg;
    document.documentElement.style.setProperty(
      "--header-color",
      "midnightblue",
    );
    document.documentElement.style.setProperty("--heat-value", "#651b20");
    document.documentElement.style.setProperty("--cool-value", "#331877");
  } else if (weatherType === "solarchange") {
    background.style.backgroundColor = "coral";
    gif.src = sunsetBg;
    document.documentElement.style.setProperty("--header-color", "indianred");
    document.documentElement.style.setProperty("--heat-value", "#2a3439");
    document.documentElement.style.setProperty("--cool-value", "#2A6F77");
  }

  // Theme adjustment for cold
  if (temp < 50) {
    const heat =
      document.documentElement.style.getPropertyValue("--heat-value");
    const cool =
      document.documentElement.style.getPropertyValue("--cool-value");
    document.documentElement.style.setProperty("--heat-value", cool);
    document.documentElement.style.setProperty("--cool-value", heat);
  }

  // 🌓 Overlay night tone if it's night — without affecting gif/theme
  if (isNight) {
    background.style.backgroundColor = "midnightblue";
    // You could also add a night filter overlay here if needed
  }

  console.log(isNight);
  gif.id = "weather-type-gif";
  gifContainer.appendChild(gif);
}
