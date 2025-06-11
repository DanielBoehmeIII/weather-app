const carouselDotSvg = `
<svg class="image-carousel-dots-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="40" />
</svg>`;
const parser = new DOMParser();

const carouselContainers = document.querySelectorAll(
  ".image-carousel-container",
);
export function addCarouselLogic() {
  carouselContainers.forEach((container) => {
    const slides = container.querySelector(".image-carousel-slides");
    console.log("adding");
    const carouselElement = slides.querySelectorAll(".date-container");
    // const nextBtn = container.querySelector(".image-carousel-next");
    // const previousBtn = container.querySelector(".image-carousel-previous");
    let state = { clicked: false };
    let index = 0;
    const totalSlides = slides.children.length;
    const dots = [];
    const navDotContainer = document.querySelector(
      ".image-carousel-nav-dot-container",
    );
    navDotContainer.addEventListener("mouseenter", () => {
      slightlyArcDots(dots);
      navDotContainer.style.transform = "translateY(-25%)";
    });
    navDotContainer.addEventListener("mouseleave", () => {
      resetDots(dots);
      navDotContainer.style.transform = "translateY(0)";
    });
    carouselElement.forEach((image, i) => {
      const navDot = assignSvg(navDotContainer);
      navDot.addEventListener("click", () => {
        state.clicked = true;
        index = i;
        updateSlide(index, slides);
        updateDots(index, dots);
      });
      const circle = navDot.querySelector("circle");
      circle.setAttribute("stroke-width", "10%");
      navDot.addEventListener("mouseenter", () => {
        if (circle) {
          circle.setAttribute("stroke-width", "20%");
        }
      });
      navDot.addEventListener("mouseleave", () => {
        if (circle) circle.setAttribute("stroke-width", "10%");
      });
      dots.push(navDot);
    });
    updateDots(index, dots);

    // nextBtn.addEventListener("click", () => {
    //   state.clicked = true;
    //   flashOnClick(nextBtn);
    //   index = (index + 1) % totalSlides;
    //   updateSlide(index, slides);
    //   updateDots(index, dots);
    // });
    // previousBtn.addEventListener("click", () => {
    //   state.clicked = true;
    //   flashOnClick(previousBtn);
    //   index = (index - 1 + totalSlides) % totalSlides;
    //   updateSlide(index, slides);
    //   updateDots(index, dots);
    // });
    autoScroll(index, slides, state, totalSlides, dots);
  });
}
function updateSlide(index, slides) {
  slides.style.transform = `translateX(-${index * 13}rem)`;
  slides.style.transition = "transform 1s ease-in-out";
}

async function autoScroll(index, slides, state, totalSlides, dots) {
  while (!state.clicked) {
    await sleep(5000);
    index = (index + 1) % totalSlides;
    updateSlide(index, slides);
    updateDots(index, dots);
  }
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// Append this instance to the parent element
function assignSvg(parent) {
  const elementSvg = parser.parseFromString(
    carouselDotSvg,
    "image/svg+xml",
  ).documentElement;
  const svgDiv = document.createElement("div");
  parent.appendChild(svgDiv);
  svgDiv.classList.add("image-carousel-svg-container");

  elementSvg.classList.add("image-carousel-dots-svg");
  svgDiv.appendChild(elementSvg);

  return svgDiv;
}

function updateDots(currentIndex, dots) {
  dots.forEach((dot, i) => {
    dot.classList.toggle("active", i === currentIndex);
  });
}

function slightlyArcDots(dots) {
  const center = Math.floor(dots.length / 2);
  const arcHeight = 2;

  dots.forEach((dot, i) => {
    const distance = Math.abs(i - center);
    const offset = arcHeight * Math.pow(distance / center, 1.5);
    dot.style.transform = `translateY(${offset}px)`;
  });
}

function resetDots(dots) {
  dots.forEach((dot, i) => {
    dot.style.transform = "translateY(0)";
  });
}

function flashOnClick(btn) {
  btn.style.fill = "rgba(255, 255, 255, 0.9)";
  btn.style.transition = "fill 0.3s ease-in-out";
  const handler = () => {
    btn.style.fill = "black";
    btn.removeEventListener("transitionend", handler);
  };
  btn.removeEventListener("transitionend", handler);
  btn.addEventListener("transitionend", handler);
}
