const revealSections = Array.from(document.querySelectorAll("[data-reveal-section]"));
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (revealSections.length > 0) {
  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealSections.forEach((section) => {
      section.classList.add("is-visible");
    });
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18 }
    );

    revealSections.forEach((section) => {
      revealObserver.observe(section);
    });
  }
}

const dragSliders = Array.from(document.querySelectorAll("[data-drag-slider]"));

dragSliders.forEach((slider) => {
  let isDragging = false;
  let startX = 0;
  let startScrollLeft = 0;
  let hasMoved = false;

  function stopDragging(pointerId) {
    if (!isDragging) {
      return;
    }

    isDragging = false;
    slider.classList.remove("is-dragging");

    if (hasMoved) {
      slider.dataset.dragged = "true";
      window.setTimeout(() => {
        slider.dataset.dragged = "false";
      }, 0);
    }

    if (pointerId != null && slider.hasPointerCapture(pointerId)) {
      slider.releasePointerCapture(pointerId);
    }
  }

  slider.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    isDragging = true;
    hasMoved = false;
    startX = event.clientX;
    startScrollLeft = slider.scrollLeft;
    slider.classList.add("is-dragging");
    slider.setPointerCapture(event.pointerId);
  });

  slider.addEventListener("pointermove", (event) => {
    if (!isDragging) {
      return;
    }

    const deltaX = event.clientX - startX;

    if (Math.abs(deltaX) > 4) {
      hasMoved = true;
    }

    slider.scrollLeft = startScrollLeft - deltaX;
  });

  slider.addEventListener("pointerup", (event) => {
    stopDragging(event.pointerId);
  });

  slider.addEventListener("pointercancel", (event) => {
    stopDragging(event.pointerId);
  });

  slider.addEventListener(
    "click",
    (event) => {
      if (slider.dataset.dragged === "true") {
        event.preventDefault();
        event.stopPropagation();
      }
    },
    true
  );
});

const lightbox = document.querySelector("[data-lightbox]");
const lightboxImage = document.querySelector("[data-lightbox-image]");
const lightboxClose = document.querySelector("[data-lightbox-close]");
const lightboxTriggers = Array.from(document.querySelectorAll("[data-lightbox-src]"));
let activeLightboxTrigger = null;

if (lightbox && lightboxImage && lightboxClose && lightboxTriggers.length > 0) {
  function openLightbox(trigger) {
    activeLightboxTrigger = trigger;
    lightboxImage.src = trigger.dataset.lightboxSrc;
    lightboxImage.alt = trigger.dataset.lightboxAlt || "";
    lightbox.hidden = false;
    document.body.classList.add("is-lightbox-open");
    lightboxClose.focus();
  }

  function closeLightbox() {
    lightbox.hidden = true;
    lightboxImage.src = "";
    lightboxImage.alt = "";
    document.body.classList.remove("is-lightbox-open");
    activeLightboxTrigger?.focus();
    activeLightboxTrigger = null;
  }

  lightboxTriggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      openLightbox(trigger);
    });
  });

  lightboxClose.addEventListener("click", closeLightbox);

  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) {
      closeLightbox();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !lightbox.hidden) {
      closeLightbox();
    }
  });
}
