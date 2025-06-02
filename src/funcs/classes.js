import { parent, delToggled } from "./createDeleteFuncs.js";
import { usernameValue } from "../index.js";
import {
  closeSvgMarkup,
  resizeSvgMarkup,
  completeTaskSound,
} from "./AssetHandling.js";
const parser = new DOMParser();
export class Element {
  constructor(elementType, elementClassName, elementId, parentElement) {
    this.elementType = elementType || null;
    if (this.elementType === null) {
      if (this.elementId) {
        throw new Error(
          `Error: ${this.elementId} Element Obj requires elementType`,
        );
      } else {
        throw new Error(`Error: Element Obj requires elementType`);
      }
      return this;
    }
    this.elementId = elementId || null;
    if (this.elementId === null) {
      throw new Error(`Error: Must assign elementId when creating Element`);
    }
    this.elementClassName = elementClassName || null;
    this.create();
    if (parentElement) {
      parentElement.appendChild(this.elementOnDOM);
    }
  }

  // Append this instance to the parent element
  assignSvg(svgMarkup) {
    const elementSvg = parser.parseFromString(
      svgMarkup,
      "image/svg+xml",
    ).documentElement;
    elementSvg.id = `${this.elementClassName}-svg`;
    this.elementOnDOM.appendChild(elementSvg);
    return elementSvg;
  }

  create() {
    const createdElement = document.createElement(this.elementType);
    createdElement.className = this.elementClassName;
    createdElement.id = this.elementId;
    this.elementOnDOM = createdElement;
    return createdElement;
  }

  createChild(elementType, elementClassName, elementId) {
    const childElement = new Element(elementType, elementClassName, elementId);
    childElement.create();
    childElement.parentElement = this;
    this.elementOnDOM.appendChild(childElement.elementOnDOM);
    return childElement;
  }

  removeFromParent() {
    this.parentElement.removeChild(this.elementOnDOM);
  }
}

export class Folder extends Element {
  constructor(elementType, elementClassName, elementId, parentElement) {
    super(elementType, elementClassName, elementId, parentElement);
    this.explorerWindow = null;
    this.resizeIcon = null;
    this.closeIcon = null;
    this.elementClassName = elementClassName;
    this.elementType = elementType;
    this.parentElement = parentElement;
    this.filePathValue = `${usernameValue}/${elementId}/`;
    this.clicked = false;
    this.selected = null;
    this.selectedElement = null;
    this.num = 0;
    this.taskNum = 0;
    this.explorer = null;
    this.tasks = [];
  }

  openExplorer() {
    // Add explorer window to the parent element
    this.explorerWindow = new Element(
      "div",
      "explorer-window",
      `${this.elementId}-file-explorer`,
      this.parentElement,
    );

    // Create the header, close icon, and resize icon
    const explorerHeader = this.explorerWindow.createChild(
      "div",
      "explorer-header",
      `${this.elementId}-header`,
    );
    this.resizeIcon = explorerHeader.assignSvg(resizeSvgMarkup);
    const filePath = explorerHeader.createChild(
      "span",
      "file-path",
      `${this.elementId}-file-path`,
    );
    filePath.elementOnDOM.textContent = `${this.filePathValue}`;
    this.closeIcon = explorerHeader.assignSvg(closeSvgMarkup);
    this.resizeIcon.id = `${this.resizeIcon.id}-resize`;
    this.closeIcon.id = `${this.closeIcon.id}-close`;

    // Create the sidebar and content sections
    const explorerSidebar = this.explorerWindow.createChild(
      "div",
      "explorer-sidebar",
      `${this.elementId}-sidebar`,
    );
    const explorerContent = this.explorerWindow.createChild(
      "div",
      "explorer-content",
      `${this.elementId}-content`,
    );
    this.explorer = explorerContent;
    const newTask = explorerSidebar.createChild(
      "div",
      "task-options",
      `${this.elementId}-new-task`,
    );
    const newText = newTask.createChild("p", "task-text", "new-task-text");
    newText.elementOnDOM.textContent = "New Task";
    // const newTaskIcon = newTask.assignSvg(newTaskSvgMarkup);
    // newTaskIcon.elementOnDOM.className = "task-icon";
    newTask.elementOnDOM.addEventListener("click", (e) => {
      createTask(this, explorerContent);
    });
    const manageTask = explorerSidebar.createChild(
      "div",
      "task-options",
      `${this.elementId}-manage-task`,
    );
    manageTask.elementOnDOM.addEventListener("click", () => {
      if (this.selectedElement != null) {
        this.selected.pressManageTask(this, explorerContent);
      }
    });
    const manageText = manageTask.createChild(
      "p",
      "task-text",
      "manage-task-text",
    );
    manageText.elementOnDOM.textContent = "Manage Task";
    const deleteTask = explorerSidebar.createChild(
      "div",
      "task-options",
      `${this.elementId}-delete-task`,
    );
    deleteTask.elementOnDOM.addEventListener("click", () => {
      if (this.selectedElement != null) {
        this.selected.pressDeleteTask(this, explorerContent);
      }
    });
    const deleteText = deleteTask.createChild(
      "p",
      "task-text",
      "delete-task-text",
    );
    deleteText.elementOnDOM.textContent = "Delete Task";
    const taskNum = parseInt(localStorage.getItem(`folder${this.num}TaskNum`));
    if (taskNum != 0) {
      for (let j = 0; j < taskNum; j++) {
        let taskName = localStorage.getItem(
          `folder${this.num}Task${j + 1}Name`,
        );
        createTask(this, this.explorer, taskName);
      }
    }
  }

  addExplorer() {
    this.elementOnDOM.addEventListener("click", () => {
      // When clicked, open the explorer
      if (this.clicked == false && delToggled == false) {
        this.clicked = true;
        this.openExplorer();
        this.explorerWindow.elementOnDOM.style.animation =
          "open 1s ease-in-out 1";
        this.closeIcon.addEventListener("click", () => {
          // Close the explorer when the close icon is clicked
          this.explorerWindow.elementOnDOM.style.animation =
            "close 1s ease-in-out 1";

          this.explorerWindow.elementOnDOM.addEventListener(
            "animationend",
            () => {
              parent.removeChild(this.explorerWindow.elementOnDOM);
              // Remove the explorer window from the parent after the closing animation
              this.closeIcon = null;
              this.resizeIcon = null;
              this.explorerWindow = null;
              this.clicked = !this.clicked;
            },
          );
        });
      }
    });
  }
}

export function createTask(folder, explorerContent, name) {
  if (!name) {
    const taskInputContainer = new Element(
      "h6",
      "task-container",
      `${folder.elementId}-task-input`,
      explorerContent.elementOnDOM,
    );
    const taskInner = taskInputContainer.createChild(
      "div",
      "task-inner",
      "task-input-inner",
    );
    const taskInputPrompt = taskInner.createChild(
      "span",
      "task-input-prompt",
      "task-input-prompt",
    );
    taskInputPrompt.elementOnDOM.innerText = "Please Enter Task info";
    const taskInputForm = taskInner.createChild(
      "div",
      "task-input-form",
      "task-input-form",
    );
    const taskNameInput = taskInputForm.createChild(
      "input",
      "task-name-input",
      `${folder.elementId}-task-name-input`,
    );
    taskNameInput.elementOnDOM.placeholder = "Enter task name";
    const taskDescriptionInput = taskInputForm.createChild(
      "input",
      "task-description-input",
      `${folder.elementId}-task-description-input`,
    );
    taskDescriptionInput.elementOnDOM.placeholder = "Enter task description";
    const formBottom = taskInputForm.createChild(
      "div",
      "task-input-form-bottom",
      "task-input-form-bottom",
    );
    const taskDateInput = formBottom.createChild(
      "input",
      "task-date-input",
      `${folder.elementId}-task-input-date`,
    );
    taskDateInput.elementOnDOM.type = "date";

    const taskSubmit = formBottom.createChild(
      "button",
      "task-submit",
      `${folder.elementId}-task-submit`,
    );
    taskSubmit.elementOnDOM.innerText = "Submit";
    taskSubmit.elementOnDOM.addEventListener("click", (e) => {
      let taskNameValue = taskNameInput.elementOnDOM.value.trim();
      let taskDescriptionValue = taskDescriptionInput.elementOnDOM.value.trim();
      let taskDateValue = taskDateInput.elementOnDOM.value;
      if (taskNameValue === "") {
        taskNameInput.elementOnDOM.setCustomValidity("Task name required");
        taskNameInput.elementOnDOM.reportValidity();
        return;
      } else if (taskDateValue === "") {
        taskDateInput.elementOnDOM.setCustomValidity("Task date required");
        taskDateInput.elementOnDOM.reportValidity();
        return;
      }
      explorerContent.elementOnDOM.removeChild(taskInputContainer.elementOnDOM);
      folder.taskNum++;
      let newTask = new Task(
        folder.taskNum,
        taskNameValue,
        taskDescriptionValue,
        taskDateValue,
      );
      localStorage.setItem(`folder${folder.num}TaskNum`, `${folder.taskNum}`);
      localStorage.setItem(
        `folder${folder.num}Task${folder.taskNum}Name`,
        taskNameValue,
      );
      localStorage.setItem(
        `folder${folder.num}Task${folder.taskNum}Description`,
        taskDescriptionValue,
      );
      localStorage.setItem(
        `folder${folder.num}Task${folder.taskNum}Date`,
        taskDateValue,
      );
      localStorage.setItem(
        `folder${folder.num}Task${folder.taskNum}Checked`,
        false,
      );
      newTask.displayTask(folder, folder.explorer, newTask);
      folder.tasks[folder.taskNum] = newTask;
    });
  } else {
    folder.taskNum++;
    localStorage.setItem(`folder${folder.num}TaskNum`, `${folder.taskNum}`);

    const taskDescriptionValue = localStorage.getItem(
      `folder${folder.num}Task${folder.taskNum}Description`,
    );
    const taskDateValue = localStorage.getItem(
      `folder${folder.num}Task${folder.taskNum}Date`,
    );
    let newTask = new Task(
      folder.taskNum,
      name,
      taskDescriptionValue,
      taskDateValue,
    );
    newTask.checked =
      localStorage.getItem(
        `folder${folder.num}Task${folder.taskNum}Checked`,
      ) === "true";
    newTask.displayTask(folder, folder.explorer, newTask);
    folder.tasks[folder.taskNum] = newTask;
  }
}

let selected = false;
export class Task {
  constructor(num, name, description, date) {
    this.num = num;
    this.name = name;
    this.description = description;
    this.date = date;
    this.selection = this;
    this.checked = false;
  }

  pressManageTask(folder, explorerContent) {
    if (folder.selectedElement) {
      explorerContent.elementOnDOM.removeChild(
        folder.selectedElement.elementOnDOM,
      );
      this.createManagedTask(folder, explorerContent);
    }
  }

  createManagedTask(folder, explorerContent) {
    const taskInputContainer = new Element(
      "h6",
      "task-container",
      `${folder.elementId}-task-input`,
      explorerContent.elementOnDOM,
    );
    const taskInner = taskInputContainer.createChild(
      "div",
      "task-inner",
      "task-input-inner",
    );
    const taskInputPrompt = taskInner.createChild(
      "span",
      "task-input-prompt",
      "task-input-prompt",
    );
    taskInputPrompt.elementOnDOM.innerText = "Please Enter Task info";
    const taskInputForm = taskInner.createChild(
      "div",
      "task-input-form",
      "task-input-form",
    );
    const taskNameInput = taskInputForm.createChild(
      "input",
      "task-name-input",
      `${folder.elementId}-task-name-input`,
    );
    taskNameInput.elementOnDOM.placeholder = "Enter task name";
    taskNameInput.elementOnDOM.value = this.name;
    const taskDescriptionInput = taskInputForm.createChild(
      "input",
      "task-description-input",
      `${folder.elementId}-task-description-input`,
    );
    taskDescriptionInput.elementOnDOM.placeholder = "Enter task description";
    taskDescriptionInput.elementOnDOM.value = this.description;
    const formBottom = taskInputForm.createChild(
      "div",
      "task-input-form-bottom",
      "task-input-form-bottom",
    );
    const taskDateInput = formBottom.createChild(
      "input",
      "task-date-input",
      `${folder.elementId}-task-input-date`,
    );
    taskDateInput.elementOnDOM.type = "date";
    taskDateInput.elementOnDOM.value = this.date;
    const taskSubmit = formBottom.createChild(
      "button",
      "task-submit",
      `${folder.elementId}-task-submit`,
    );
    taskSubmit.elementOnDOM.innerText = "Submit";
    taskSubmit.elementOnDOM.addEventListener("click", (e) => {
      this.name = taskNameInput.elementOnDOM.value.trim();
      this.description = taskDescriptionInput.elementOnDOM.value.trim();
      this.date = taskDateInput.elementOnDOM.value;
      if (this.name === "") {
        taskNameInput.elementOnDOM.setCustomValidity("Task name required");
        taskNameInput.elementOnDOM.reportValidity();
        return;
      } else if (this.date === "") {
        taskDateInput.elementOnDOM.setCustomValidity("Task date required");
        taskDateInput.elementOnDOM.reportValidity();
        return;
      }
      explorerContent.elementOnDOM.removeChild(taskInputContainer.elementOnDOM);
      localStorage.setItem(`folder${folder.num}Task${this.num}Name`, this.name);
      localStorage.setItem(
        `folder${folder.num}Task${this.num}Description`,
        this.description,
      );
      localStorage.setItem(`folder${folder.num}Task${this.num}Date`, this.date);
      this.displayTask(folder, folder.explorer);
      folder.tasks[this.num] = this;
    });
  }

  displayTask(folder, explorerContent) {
    const taskDisplayContainer = new Element(
      "div",
      "task-container",
      `${folder.elementId}-${this.name}`,
      explorerContent.elementOnDOM,
    );
    const taskInner = taskDisplayContainer.createChild(
      "div",
      "task-inner",
      `${folder.elementId}-${this.name}-inner`,
    );
    const taskNameDisplay = taskInner.createChild(
      "h6",
      "task-name",
      `${folder.elementId}-${this.name}-name`,
    );
    taskNameDisplay.elementOnDOM.innerText = `${this.name}`;
    const taskForm = taskInner.createChild(
      "div",
      "task-form",
      `${folder.elementId}-${this.num}-form`,
    );
    const taskDescriptionDisplay = taskForm.createChild(
      "p",
      "task-description",
      `${folder.elementId}-${this.num}-description`,
    );
    taskDescriptionDisplay.elementOnDOM.innerText = `${this.description}`;
    const bottomForm = taskForm.createChild(
      "div",
      "form-bottom",
      `${folder.elementId}-${this.num}-form-bottom`,
    );
    const taskDateDisplay = bottomForm.createChild(
      "date",
      "task-date",
      `${folder.elementId}-${this.num}-date`,
    );
    taskDateDisplay.elementOnDOM.innerText = `${this.date}`;
    const taskCheckbox = bottomForm.createChild(
      "input",
      "task-check-box",
      `${folder.elementId}-${this.num}`,
    );
    taskCheckbox.elementOnDOM.type = "checkbox";
    taskCheckbox.elementOnDOM.checked = this.checked;
    taskCheckbox.elementOnDOM.addEventListener("change", (e) => {
      if (e.target.checked) {
        completeTaskSound.play();
        taskForm.elementOnDOM.style.animation = "grow 5s ease-in-out 1";
        localStorage.setItem(`folder${folder.num}Task${this.num}Checked`, true);
        this.checked = true;
      } else {
        taskDisplayContainer.elementOnDOM.style.animation = "";
        taskForm.elementOnDOM.style.animation = "";
        localStorage.setItem(
          `folder${folder.num}Task${this.num}Checked`,
          false,
        );
        this.checked = false;
      }
    });
    taskDisplayContainer.elementOnDOM.addEventListener("click", (e) => {
      folder.selected = this;
      folder.selectedElement = taskDisplayContainer;
      const isSelected =
        taskDisplayContainer.elementOnDOM.getAttribute("data-selected") ===
        "true";
      if (isSelected) {
        this.isSelected = false;
        taskDisplayContainer.elementOnDOM.style.animation = "";
        taskDisplayContainer.elementOnDOM.setAttribute(
          "data-selected",
          "false",
        );
      } else if (!selected) {
        this.isSelected = true;
        taskDisplayContainer.elementOnDOM.style.animation =
          "select 0.2s ease-in-out forwards";
        taskDisplayContainer.elementOnDOM.setAttribute("data-selected", "true");
      }
    });
  }

  pressDeleteTask(folder, explorerContent) {
    explorerContent.elementOnDOM.removeChild(
      folder.selectedElement.elementOnDOM,
    );
    for (let i = folder.taskNum - 1; i >= this.num; i--) {
      localStorage.setItem(
        `folder${folder.num}Task${i}Name`,
        localStorage.getItem(`folder${folder.num}Task${i + 1}Name`),
      );
      localStorage.setItem(
        `folder${folder.num}Task${i}Description`,
        localStorage.getItem(`folder${folder.num}Task${i + 1}Description`),
      );
      localStorage.setItem(
        `folder${folder.num}Task${i}Date`,
        localStorage.getItem(`folder${folder.num}Task${i + 1}Date`),
      );
      folder.tasks[i].name = localStorage.getItem(
        `folder${folder.num}Task${i + 1}Name`,
      );
      folder.tasks[i].description = localStorage.removeItem(
        `folder${folder.num}Task${i + 1}Description`,
      );
      folder.tasks[i].date = localStorage.removeItem(
        `folder${folder.num}Task${i + 1}Date`,
      );
      localStorage.removeItem(`folder${folder.num}Task${i + 1}Name`);
      localStorage.removeItem(`folder${folder.num}Task${i + 1}Date`);
      localStorage.removeItem(`folder${folder.num}Task${i + 1}description`);
    }
    folder.taskNum--;
    localStorage.setItem(`folder${folder.num}TaskNum`, folder.taskNum);
  }
}
