import "./style.css";
import "./media-query.css";
import icons from "./icon";
import { addCarouselLogic } from "./carousel/image-carousel.js";
import "./carousel/image-carousel-style.css";
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

let globalData;
let globalCity;
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
    const city = await getCityName(lat, long);
    let weatherData = await getWeather(locationString);
    globalData = weatherData;
    globalCity = city;
    appendMainWeatherData(weatherData, 0, city, "Today");
    appendMainDetailData(weatherData, 0);
    getFutureDisplay(weatherData);
  } catch (error) {
    console.log("No location available for ", position, ": ", error.message);
  }
}

async function getCityName(lat, long) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${long}`,
    );
    const data = await response.json();
    const address = data.address;
    return (
      address.city ||
      address.town ||
      address.village ||
      address.hamlet ||
      address.county ||
      address.state
    );
  } catch (error) {
    console.log("Nominatim reverse geocoding failed:", error);
    return `${lat},${long}`;
  }
}

async function getWeather(location) {
  try {
    let response = await fetch(
      `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${location}?key=XYYPKNCVA3BUDH5C2JF3DT68M&iconSet=icons1`,
    );
    let data = await response.json();
    return data;
  } catch (error) {
    console.log("Weather fetch failed: ", error);
  }
}

async function loadSvgIcon(path, container) {
  const response = await fetch(path);
  const svgText = await response.text();
  container.innerHTML = svgText;
  const svg = container.querySelector("svg");
  svg.classList.add("icon");
}

function appendMainWeatherData(data, day, title, dayName) {
  const titleElement = document.getElementById("title");
  const iconImg = document.getElementById("main-icon");
  const mainTemp = document.getElementById("main-temp");
  const mainHigh = document.getElementById("main-high");
  const mainLow = document.getElementById("main-low");
  const mainHighLowContainer = document.getElementById(
    "main-max-min-container",
  );
  mainTemp.addEventListener("mouseenter", () => {
    transformVals(mainTemp);
  });
  mainHighLowContainer.addEventListener("mouseenter", () => {
    transformVals(mainHigh);
    transformVals(mainLow);
  });
  mainTemp.addEventListener("mouseleave", () => {
    resetVals(mainTemp);
  });
  mainHighLowContainer.addEventListener("mouseleave", () => {
    resetVals(mainHigh);
    resetVals(mainLow);
  });

  const iconName = data.days[day].icon; // e.g., "clear-day"
  const svgPath = icons[iconName];

  if (svgPath) {
    loadSvgIcon(svgPath, iconImg);
  } else {
    console.warn(`SVG icon not found: ${iconName}`);
  }

  titleElement.textContent = `${title.toUpperCase()} - ${dayName}`;
  mainTemp.textContent = `${data.days[day].temp}°`;
  mainHigh.textContent = `${data.days[day].tempmax}°`;
  mainLow.textContent = `${data.days[day].tempmin}°`;

  setWeatherType(data);
}

function appendMainDetailData(data, day) {
  const rainChance = document.getElementById("rain-chance");
  const windSpeed = document.getElementById("wind-speed");
  const sunriseTime = document.getElementById("sunrise-time");
  const sunsetTime = document.getElementById("sunset-time");
  const atmosphericPressure = document.getElementById("atmospheric-pressure");
  const uvIndex = document.getElementById("uv-index");
  const humidity = document.getElementById("humidity");
  const gusts = document.getElementById("gusts");
  const description = document.getElementById("main-description");
  rainChance.textContent = `${data.days[day].precipprob}%`;
  windSpeed.textContent = data.days[day].windspeed;
  sunriseTime.textContent = formatTime12h(data.days[day].sunrise);
  sunsetTime.textContent = formatTime12h(data.days[day].sunset);
  atmosphericPressure.textContent = data.days[day].pressure;
  uvIndex.textContent = data.days[day].uvindex;
  humidity.textContent = data.days[day].humidity;
  gusts.textContent = data.days[day].windgust;
  description.textContent = data.days[day].description;
}

function formatTime12h(time24) {
  // time24 example: "18:45:00"
  const [hourStr, minuteStr] = time24.split(":");
  let hour = parseInt(hourStr, 10);
  const minute = minuteStr;
  const ampm = hour >= 12 ? "PM" : "AM";

  // Convert 24h to 12h
  hour = hour % 12;
  if (hour === 0) hour = 12; // 0 means 12 AM or 12 PM

  return `${hour}:${minute} ${ampm}`;
}

async function execute() {
  await getLocation();
  // // Call the carousel logic after the DOM loads
}

execute();

const errorSleep = (ms) => new Promise((r) => setTimeout(r, ms));

const searchBar = document.getElementById("search-bar");
const searchError = document.getElementById("search-error");
const errorContainer = document.getElementById("error-container");
const arrow = document.querySelector(".arrow");
const searchBtn = document.getElementById("search-btn");
function showError(message) {
  errorContainer.style.opacity = "1";
  errorContainer.style.visibility = "visible";

  arrow.classList.add("visible");

  searchError.style.opacity = "1";
  searchError.textContent = message;
}

function hideError() {
  errorContainer.style.opacity = "0";
  errorContainer.style.visibility = "hidden";

  arrow.classList.remove("visible");

  searchError.style.opacity = "0";
  searchError.textContent = "";
}

let searchString;
searchBar.addEventListener("keydown", async (e) => {
  if (e.key === "Enter" || e.code === "Enter" || e.keyCode === 13) {
    searchString = searchBar.value;
    try {
      let weatherData = await getWeather(searchString);
      globalData = await weatherData;
      globalCity = await searchString;
      appendMainWeatherData(weatherData, 0, searchString, "Today");
      appendMainDetailData(weatherData, 0);
      getFutureDisplay(weatherData);
      setWeatherType(weatherData);
    } catch (error) {
      if (!searchString || searchString.trim() === "") {
        showError("Please enter a location");
        await errorSleep(3000);
        hideError();
      } else {
        showError(
          `No location available for ${searchString}: ${error.message}`,
        );
        await errorSleep(3000);
        hideError();
      }
    }
  }
});

searchBtn.onclick = async () => {
  searchString = searchBar.value;
  try {
    let weatherData = await getWeather(searchString);
    globalData = await weatherData;
    globalCity = await searchString;
    appendMainWeatherData(weatherData, 0, searchString, "Today");
    appendMainDetailData(weatherData, 0);
    getFutureDisplay(weatherData);
    setWeatherType(weatherData);
  } catch (error) {
    if (!searchString || searchString.trim() === "") {
      showError("Please enter a location");
      await errorSleep(3000);
      hideError();
    } else {
      showError(`No location available for ${searchString}`);
      await errorSleep(3000);
      hideError();
    }
  }
};

function setWeatherType(data) {
  const today = data.days[0];
  const temp = today.temp;
  const precip = today.precipprob;
  const cloudCover = today.cloudcover;

  const sunriseTime = new Date(today.sunriseEpoch * 1000); // UTC
  const sunsetTime = new Date(today.sunsetEpoch * 1000); // UTC

  const now = new Date(); // Also UTC when compared as timestamps

  console.log("now UTC:", now.toISOString());
  console.log("sunrise:", sunriseTime.toISOString());
  console.log("sunset:", sunsetTime.toISOString());

  const halfHour = 30 * 60 * 1000;
  const nearSunrise = Math.abs(now - sunriseTime) <= halfHour;
  const nearSunset = Math.abs(now - sunsetTime) <= halfHour;

  let weatherType;
  if (nearSunrise || nearSunset) {
    weatherType = "solarchange";
  } else if (temp <= 32) {
    weatherType = "snow";
  } else if (precip > 50 && temp > 32) {
    weatherType = "storm";
  } else if (cloudCover >= 80 && temp >= 32) {
    weatherType = "clouds";
  } else {
    weatherType = "sun";
  }

  const isNight = now < sunriseTime || now > sunsetTime;

  console.log("weatherType:", weatherType);
  console.log("isNight:", isNight);

  changeTheme(weatherType, temp, isNight);
}

const background = document.querySelector("body");
const gif = document.createElement("img");
const gifContainer = document.getElementById("right-main-container");

function changeTheme(weatherType, temp, isNight) {
  document.documentElement.style.setProperty("--detail-color", "white");
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
    document.documentElement.style.setProperty("--detail-color", "black");
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
    document.documentElement.style.setProperty("--heat-value", "maroon");
    document.documentElement.style.setProperty("--cool-value", "rebeccapurple");
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
  }

  gif.id = "weather-type-gif";
  gifContainer.appendChild(gif);
}

const mainContainer = document.getElementById("main-container");
const middleContainer = document.getElementById("data-container");
const carouselContainer = document.querySelector(".image-carousel-frame");
mainContainer.addEventListener("mouseenter", () => {
  transformContainer(mainContainer);
});
middleContainer.addEventListener("mouseenter", () => {
  transformContainer(middleContainer);
});
carouselContainer.addEventListener("mouseenter", () => {
  transformContainer(carouselContainer);
});
mainContainer.addEventListener("mouseleave", () => {
  resetContainer(mainContainer);
});
middleContainer.addEventListener("mouseleave", () => {
  resetContainer(middleContainer);
});
carouselContainer.addEventListener("mouseleave", () => {
  resetContainer(carouselContainer);
});

function transformContainer(container) {
  container.style.transform = "translateY(-0.25%)";
}

function resetContainer(container) {
  container.style.transform = "translateY(0)";
}

function transformVals(val) {
  val.style.transform = "translateY(-1.5%)";
  val.setAttribute("above", true);
}

function resetVals(val) {
  val.style.transform = "translateY(0)";
  val.setAttribute("above", false);
}

const days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function getFutureDisplay(data) {
  const carouselSlides = document.querySelector(".image-carousel-slides");
  if (carouselSlides) {
    carouselSlides.innerHTML = ""; // Clear previous slides!
  }
  for (let i = 1; i < data.days.length; i++) {
    const futureDate = new Date(`${data.days[i].datetime}T00:00:00`);
    appendFutureWeatherData(data, futureDate, i);
  }
  addCarouselLogic();
}

function appendFutureWeatherData(data, date, index) {
  const carouselSlides = document.querySelector(".image-carousel-slides");
  const dayContainer = document.createElement("div");
  dayContainer.classList.add("date-container");
  dayContainer.addEventListener("click", () => {
    const dayName = dayContainer.querySelector(".name-of-day").textContent;
    appendMainWeatherData(globalData, index, globalCity, `${dayName}`);
    appendMainDetailData(globalData, index);
  });

  const nameOfDay = days[date.getDay()];
  const nameContainer = document.createElement("p");
  nameContainer.textContent = `${nameOfDay}`;
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
  carouselSlides.appendChild(dayContainer);
}

const infoSpan = document.getElementById("info-span");
infoSpan.addEventListener("mouseenter", () => {
  transformVals(infoSpan);
});
infoSpan.addEventListener("mouseleave", () => {
  resetVals(infoSpan);
});

const linkImgs = document.querySelectorAll(".link-img");
linkImgs.forEach((img) => {
  img.addEventListener("mouseenter", () => {
    transformVals(img);
  });
  img.addEventListener("mouseleave", () => {
    resetVals(img);
  });
});
