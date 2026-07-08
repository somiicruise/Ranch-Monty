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
const dragThreshold = 10;

dragSliders.forEach((slider) => {
  let isPointerDown = false;
  let isDragging = false;
  let startX = 0;
  let startScrollLeft = 0;

  function stopDragging(pointerId) {
    const wasDragging = isDragging;

    isPointerDown = false;
    isDragging = false;
    slider.classList.remove("is-dragging");

    if (wasDragging) {
      slider.dataset.dragged = "true";
      window.setTimeout(() => {
        slider.dataset.dragged = "false";
      }, 120);
    }

    if (pointerId != null && slider.hasPointerCapture(pointerId)) {
      try {
        slider.releasePointerCapture(pointerId);
      } catch {
        // Pointer capture can already be released by the browser.
      }
    }
  }

  slider.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    isPointerDown = true;
    isDragging = false;
    startX = event.clientX;
    startScrollLeft = slider.scrollLeft;
  });

  slider.addEventListener("pointermove", (event) => {
    if (!isPointerDown) {
      return;
    }

    const deltaX = event.clientX - startX;

    if (!isDragging && Math.abs(deltaX) > dragThreshold) {
      isDragging = true;
      slider.classList.add("is-dragging");
      try {
        slider.setPointerCapture(event.pointerId);
      } catch {
        // Drag still works if pointer capture is unavailable.
      }
    }

    if (!isDragging) {
      return;
    }

    event.preventDefault();
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
