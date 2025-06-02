import "./style.css";
import { bgArray, powerOnSound, powerOffSound } from "./funcs/AssetHandling.js";
import {
  createFolder,
  createApp,
  toggleDelete,
  parent,
} from "./funcs/createDeleteFuncs.js";
import { beginLocalStorage } from "./funcs/localStorage.js";
export let usernameValue = "Username";
const grandparent = document.getElementById("content");
parent.id = "pc-box";
let bgImg = document.createElement("img");
bgImg.id = "bgImg";
bgImg.src = bgArray[0];
grandparent.appendChild(parent);
parent.appendChild(bgImg);
// Create the app instance and append it after initialization
const createAppElement = createApp("create-new-app", null);
createAppElement.elementOnDOM.addEventListener("click", (e) => createFolder());
export const deleteAppElement = createApp("delete-app", null);
deleteAppElement.elementOnDOM.addEventListener("click", () => {
  toggleDelete();
});
window.onload = () => {
  beginLocalStorage();
};

const leftArrow = document.getElementById("left-arrow");
const rightArrow = document.getElementById("right-arrow");
let bgNum = 0;

leftArrow.addEventListener("click", () => {
  if (bgNum === 0) {
    bgNum = bgArray.length - 1;
  } else {
    --bgNum;
  }
  changeBg(bgNum);
  localStorage.setItem("bgImgIndex", bgNum);
});

rightArrow.addEventListener("click", () => {
  if (bgNum === bgArray.length - 1) {
    bgNum = 0;
  } else {
    ++bgNum;
  }
  changeBg(bgNum);
  localStorage.setItem("bgImgIndex", bgNum);
});

export function changeBg(index) {
  bgImg.src = bgArray[index];
}

let powerOn = true;

async function turnOn() {
  powerOnSound.play();
  parent.style.animation = "scale-in 1s ease-in-out 1";
  grandparent.appendChild(parent);
  await sleep(1000);
}

async function turnOff() {
  powerOffSound.play();
  parent.style.animation = "scale-out 1s ease-in-out 1";
  await sleep(1000);
  grandparent.removeChild(parent);
}

const power = document.getElementById("power");
power.addEventListener("click", () => {
  if (powerOn) {
    turnOff();
  } else {
    turnOn();
  }
  powerOn = !powerOn;
});

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

const usernameDisplay = document.getElementById("username-display");
const usernameContainer = document.getElementById("username-container");
let usernameInput = document.createElement("input");
usernameInput.id = "username-input";

usernameDisplay.addEventListener("click", (e) => {
  changeUser();
});

export function changeUser(name) {
  if (name == null) {
    usernameContainer.removeChild(usernameDisplay);
    usernameContainer.appendChild(usernameInput);
    usernameInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        usernameValue = usernameInput.value;
        usernameDisplay.textContent = `${usernameValue}`;
        usernameContainer.removeChild(usernameInput);
        usernameContainer.appendChild(usernameDisplay);
        localStorage.setItem("username", usernameValue);
      }
    });
  } else {
    usernameDisplay.textContent = `${name}`;
    usernameValue = name;
  }
}
