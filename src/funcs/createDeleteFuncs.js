import { Folder, Element, Task } from "./classes.js";
import { deleteAppElement } from "../index.js";
import {
  newAppSvgMarkup,
  folderSvgMarkup,
  deleteSvgMarkup,
  closeSvgMarkup,
} from "./AssetHandling.js";

let folders = [];
export const parent = document.createElement("div");
export let customCounter = 1;
export let delToggled = false;
export let foldersCreated = 0;
export function createFolder(name) {
  if (!name) {
    const newFolderPromptContainer = new Element(
      "div",
      "new-folder-prompt-container",
      "new-folder-prompt-container",
      parent,
    );
    const newFolderPrompt = newFolderPromptContainer.createChild(
      "div",
      "new-folder-prompt",
      "new-folder-prompt",
    );
    const textPrompt = newFolderPrompt.createChild(
      "div",
      "text-prompt",
      "text-prompt",
    );

    let closeIcon = textPrompt.assignSvg(closeSvgMarkup);
    closeIcon.id = "prompt-close-icon";

    const folderInputForm = newFolderPrompt.createChild(
      "div",
      "folder-form",
      "folder-form",
    );
    const folderNameInput = folderInputForm.createChild(
      "input",
      "folder-name-input",
      "folder-name-input",
    );
    folderNameInput.elementOnDOM.placeholder = "Enter folder name";

    const submitFolderButton = folderInputForm.createChild(
      "button",
      "folder-submit-input",
      "folder-name-button",
    );
    submitFolderButton.elementOnDOM.innerText = "Submit";

    // Open animation
    newFolderPromptContainer.elementOnDOM.style.animation =
      "open 1s ease-in-out 1";

    // Function to handle closing animations
    const handleClose = () => {
      newFolderPromptContainer.elementOnDOM.style.animation =
        "close 1s ease-in-out 1";
      newFolderPromptContainer.elementOnDOM.addEventListener(
        "animationend",
        () => {
          parent.removeChild(newFolderPromptContainer.elementOnDOM);
          // Cleanup
          closeIcon = null;
        },
      );
    };

    // Close button logic
    closeIcon.addEventListener("click", handleClose);

    // Submit button logic
    submitFolderButton.elementOnDOM.addEventListener("click", () => {
      const folderNameValue =
        folderNameInput.elementOnDOM.value.trim() || `Folder-${customCounter}`;
      customCounter++;

      // Closing animation
      newFolderPromptContainer.elementOnDOM.style.animation =
        "close 1s ease-in-out 1";
      newFolderPromptContainer.elementOnDOM.addEventListener(
        "animationend",
        () => {
          parent.removeChild(newFolderPromptContainer.elementOnDOM);

          initializeFolder(folderNameValue);
          closeIcon = null;
        },
      );
    });
  } else {
    return initializeFolder(name);
  }
}

function initializeFolder(name) {
  let newFolder = createApp("folder", name);
  // Create the new folder and add the explorer
  folders[foldersCreated] = newFolder;
  foldersCreated++;
  localStorage.setItem(`folder${foldersCreated}Name`, name);
  newFolder.num = foldersCreated;
  localStorage.setItem("foldersCreated", foldersCreated);
  newFolder.addExplorer();
  newFolder.elementOnDOM.addEventListener("click", (e) => {
    if (delToggled == true) {
      console.log(newFolder.taskNum);
      for (let i = newFolder.taskNum; i >= newFolder.num; i--) {
        let nextName = localStorage.getItem(
          `folder${newFolder.num}Task${i + 1}Name`,
        );
        let nextDescription = localStorage.getItem(
          `folder${newFolder.num}Task${i + 1}Description`,
        );
        let nextDate = localStorage.getItem(
          `folder${newFolder.num}Task${i + 1}Date`,
        );
        localStorage.setItem(`folder${newFolder.num}Task${i}Name`, nextName);
        localStorage.setItem(
          `folder${newFolder.num}Task${i}Description`,
          nextDescription,
        );
        localStorage.setItem(`folder${newFolder.num}Task${i}Date`, nextDate);
        localStorage.removeItem(`folder${newFolder.num}Task${i + 1}Name`);
        localStorage.removeItem(`folder${newFolder.num}Task${i + 1}Date`);
        localStorage.removeItem(
          `folder${newFolder.num}Task${i + 1}description`,
        );
      }
      for (let i = newFolder.num + 1; i < foldersCreated; i++) {
        --folders[i].num;
      }
      --foldersCreated;
      localStorage.setItem("foldersCreated", foldersCreated);
      newFolder.elementOnDOM.style.animation = "fade-out-red 1s ease-in-out 1";
      newFolder.elementOnDOM.addEventListener("animationend", () => {
        // parent.removeChild(newFolder);
        parent.removeChild(newFolder.elementOnDOM);
        newFolder = null;
        return;
      });
    }
  });
  return newFolder;
}

export function createApp(type, id) {
  let createdApp = null;
  let appSvgMarkup = null;
  let textValue = null;
  let className = null;
  if (type === "create-new-app") {
    className = "create-app";
    id = "create-new-app";
    appSvgMarkup = newAppSvgMarkup;
    textValue = "Create";
    createdApp = new Element("div", className, id, parent);
  } else if (type === "delete-app") {
    className = "delete-app";
    id = "delete-app";
    appSvgMarkup = deleteSvgMarkup;
    textValue = "Delete";
    createdApp = new Element("div", className, id, parent);
  } else {
    className = "folder";
    textValue = id;
    appSvgMarkup = folderSvgMarkup;
    createdApp = new Folder("div", className, id, parent);
  }

  createdApp.assignSvg(appSvgMarkup);
  const description = createdApp.createChild(
    "span",
    "app-description",
    `${id}-description`,
  );
  description.elementOnDOM.innerText = textValue;
  createdApp.elementOnDOM.style.animation = "fade 1s ease-in-out 1";
  return createdApp;
}

export function toggleDelete() {
  delToggled = !delToggled;
  let delText = deleteAppElement.elementOnDOM.querySelector(
    "#delete-app-description",
  );
  deleteAppElement.elementOnDOM.style.animation = "none";
  if (delToggled) {
    deleteAppElement.elementOnDOM.style.animation = "grow-red 1s ease-in-out 3";
    delText.textContent = "Delete Toggled";
  } else {
    delText.textContent = "Delete";
  }
}
