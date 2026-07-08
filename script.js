const revealSections = Array.from(document.querySelectorAll("[data-reveal-section]"));
const scrollSliceImages = Array.from(document.querySelectorAll("[data-scroll-slice-image]"));
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
      { threshold: 0.16, rootMargin: "0px 0px 6% 0px" }
    );

    revealSections.forEach((section) => {
      revealObserver.observe(section);
    });
  }
}

if (scrollSliceImages.length > 0 && !prefersReducedMotion) {
  const sliceTiming = [
    { start: 0, end: 0.24, skew: 12 },
    { start: 0.2, end: 0.54, skew: -10 },
    { start: 0.5, end: 0.74, skew: 14 },
    { start: 0.7, end: 0.9, skew: -9 },
    { start: 0.86, end: 1, skew: 12 },
  ];
  let sliceFrame = null;

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function setSliceProgress(slice, progress, skew) {
    const lead = progress * 118;
    const front = skew < 0 ? lead + skew : lead;
    const back = skew > 0 ? lead - skew : lead;

    slice.style.setProperty("--slice-front", `${clamp(front, 0, 118)}%`);
    slice.style.setProperty("--slice-back", `${clamp(back, 0, 118)}%`);
  }

  function updateScrollSlices() {
    sliceFrame = null;

    scrollSliceImages.forEach((image) => {
      const rect = image.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      const revealStart = viewportHeight * 0.9;
      const revealDistance = viewportHeight * 0.58 + rect.height * 0.35;
      const overallProgress = clamp((revealStart - rect.top) / revealDistance, 0, 1);
      const slices = Array.from(image.querySelectorAll(".about-section__slice"));

      image.classList.add("is-sliced");

      slices.forEach((slice, index) => {
        const timing = sliceTiming[index] || sliceTiming[sliceTiming.length - 1];
        const progress = clamp(
          (overallProgress - timing.start) / (timing.end - timing.start),
          0,
          1
        );

        setSliceProgress(slice, progress, timing.skew);
      });
    });
  }

  function requestSliceUpdate() {
    if (sliceFrame == null) {
      sliceFrame = window.requestAnimationFrame(updateScrollSlices);
    }
  }

  updateScrollSlices();
  window.addEventListener("scroll", requestSliceUpdate, { passive: true });
  window.addEventListener("resize", requestSliceUpdate);
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
