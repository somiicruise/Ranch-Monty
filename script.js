const slides = Array.from(document.querySelectorAll(".slide"));
const dots = Array.from(document.querySelectorAll(".slider-dot"));
const previousButton = document.querySelector("[data-slider-prev]");
const nextButton = document.querySelector("[data-slider-next]");

let activeIndex = 0;

function showSlide(index) {
  activeIndex = (index + slides.length) % slides.length;

  slides.forEach((slide, slideIndex) => {
    slide.classList.toggle("is-active", slideIndex === activeIndex);
  });

  dots.forEach((dot, dotIndex) => {
    dot.classList.toggle("is-active", dotIndex === activeIndex);
  });
}

previousButton.addEventListener("click", () => {
  showSlide(activeIndex - 1);
});

nextButton.addEventListener("click", () => {
  showSlide(activeIndex + 1);
});

dots.forEach((dot) => {
  dot.addEventListener("click", () => {
    showSlide(Number(dot.dataset.slideTo));
  });
});
