// Code from "https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API"
// that has been refactored for this project
import { changeBg, changeUser } from "../index.js";
import { createTask } from "./classes.js";
import { createFolder } from "./createDeleteFuncs.js";
function storageAvailable(type) {
  let storage;
  try {
    storage = window[type];
    const x = "__storage_test__";
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  } catch (e) {
    return (
      e instanceof DOMException &&
      e.name === "QuotaExceededError" &&
      // acknowledge QuotaExceededError only if there's something already stored
      storage &&
      storage.length !== 0
    );
  }
}

export function beginLocalStorage() {
  if (storageAvailable("localStorage")) {
    if (
      localStorage.getItem("bgImgIndex") == null ||
      localStorage.getItem("bgImgIndex") == undefined
    ) {
      console.log("populating");
      populateStorage();
    } else {
      console.log("configuring");
      setConfig();
    }
  } else {
    console.log("LocalStorage unavailable");
  }
}

function setConfig() {
  const bgStyle = parseInt(localStorage.getItem("bgImgIndex"));
  changeBg(bgStyle);
  const username = localStorage.getItem("username");
  changeUser(username);
  const foldersCreated = parseInt(localStorage.getItem("foldersCreated"));
  for (let i = 1; i <= foldersCreated; i++) {
    const folderName = localStorage.getItem(`folder${i}Name`);
    const newFolder = createFolder(folderName);
  }
}

function populateStorage() {
  localStorage.setItem("bgImgIndex", 0);
  localStorage.setItem("foldersCreated", 0);
}
