(function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const header = document.querySelector("[data-header]");
  const menuToggle = document.querySelector("[data-menu-toggle]");
  const mobileMenu = document.querySelector("[data-mobile-menu]");
  const mobileCta = document.querySelector("[data-mobile-cta]");
  const stickyCtaSuppressors = Array.from(document.querySelectorAll(".arranged, #signup"));
  let selectedSport = "Падел";
  let headerTicking = false;

  document.documentElement.classList.add("has-js");

  function splitText() {
    document.querySelectorAll("[data-split]").forEach((element) => {
      if (element.dataset.splitReady === "true") return;
      let wordIndex = 0;

      const lineParts = element.innerHTML
        .split(/<br\s*\/?>/gi)
        .map((part) => part.replace(/<[^>]*>/g, "").trim())
        .filter(Boolean);

      element.innerHTML = lineParts
        .map((line, lineIndex) =>
          line
            .split(/(\s+)/)
            .map((token, tokenIndex) => {
              if (/^\s+$/.test(token)) return token;
              const emphasis = element.dataset.emphasis === token;
              const index = wordIndex++;
              return `<span class="split-word${emphasis ? " is-emphasis" : ""}" style="--word-index: ${index}">${token}</span>`;
            })
            .join("")
        )
        .join("<br>");

      element.dataset.splitReady = "true";
    });
  }

  function initTypewriter() {
    const el = document.querySelector("[data-rotate]");
    if (!el) return;

    let words;
    try {
      words = JSON.parse(el.dataset.rotate);
    } catch (error) {
      return;
    }
    if (!Array.isArray(words) || !words.length) return;

    el.textContent = words[0];
    if (reduceMotion) return;

    let wordIndex = 0;
    let charIndex = words[0].length;
    let deleting = true;

    function tick() {
      const current = words[wordIndex];
      if (deleting) {
        charIndex -= 1;
        el.textContent = current.slice(0, charIndex);
        if (charIndex <= 0) {
          deleting = false;
          wordIndex = (wordIndex + 1) % words.length;
          window.setTimeout(tick, 360);
        } else {
          window.setTimeout(tick, 45);
        }
      } else {
        const next = words[wordIndex];
        charIndex += 1;
        el.textContent = next.slice(0, charIndex);
        if (charIndex >= next.length) {
          deleting = true;
          window.setTimeout(tick, 1700);
        } else {
          window.setTimeout(tick, 85);
        }
      }
    }

    window.setTimeout(tick, 1700);
  }

  function initReveal() {
    const selectors = [
      "[data-split]",
      ".hero__lead",
      ".hero__actions",
      ".hero__hint",
      ".who__lead",
      ".who__button",
      ".who-card",
      ".who-cta",
      ".arranged__media",
      ".arranged__lead",
      ".arranged__features li",
      ".arranged__cta",
      ".arranged__steps",
      ".copy-block",
      ".activity-card",
      ".context-cta",
      ".cafe__content > p:not(.eyebrow)",
      ".partner-badge",
      ".cafe__cta",
      ".step-item",
      ".level__copy",
      ".price__next",
      ".price__body",
      ".quiet-line",
      ".price .button",
      ".trust-block",
      ".accordion__item",
      ".sport-choice",
      ".signup-form",
      ".signup__micro"
    ];

    const targets = Array.from(document.querySelectorAll(selectors.join(",")));
    targets.forEach((target, index) => {
      target.classList.add("reveal-item");
      target.style.setProperty("--reveal-delay", `${Math.min(index % 5, 4) * 55}ms`);
    });

    if (reduceMotion || !("IntersectionObserver" in window)) {
      targets.forEach((target) => target.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        rootMargin: "0px 0px -12% 0px",
        threshold: 0.08
      }
    );

    targets.forEach((target) => observer.observe(target));
  }

  function updateHeaderNow() {
    if (!header) return;
    const scrolled = window.scrollY > 100;
    header.classList.toggle("is-scrolled", scrolled);
    if (mobileCta) {
      const overlapsLocalCta = stickyCtaSuppressors.some((section) => {
        const rect = section.getBoundingClientRect();
        return rect.top < window.innerHeight * 0.88 && rect.bottom > header.offsetHeight + 32;
      });
      mobileCta.classList.toggle(
        "is-visible",
        window.innerWidth < 920 && window.scrollY > window.innerHeight * 0.82 && !overlapsLocalCta
      );
    }
  }

  function scheduleHeaderUpdate() {
    if (headerTicking) return;
    headerTicking = true;
    requestAnimationFrame(() => {
      updateHeaderNow();
      headerTicking = false;
    });
  }

  function closeMobileMenu() {
    if (!menuToggle || !mobileMenu) return;
    menuToggle.setAttribute("aria-expanded", "false");
    mobileMenu.classList.remove("is-open");
    document.body.classList.remove("menu-open");
  }

  function initMenu() {
    if (!menuToggle || !mobileMenu) return;

    menuToggle.addEventListener("click", () => {
      const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
      menuToggle.setAttribute("aria-expanded", String(!isOpen));
      mobileMenu.classList.toggle("is-open", !isOpen);
      document.body.classList.toggle("menu-open", !isOpen);
    });

    mobileMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMobileMenu);
    });
  }

  function initAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener("click", closeMobileMenu);
    });
  }

  function setPanelOpen(item, open) {
    const button = item.querySelector("button");
    const panel = item.querySelector(".accordion__panel");
    const icon = item.querySelector(".accordion__icon");
    if (!button || !panel) return;

    item.classList.toggle("is-open", open);
    button.setAttribute("aria-expanded", String(open));
    panel.hidden = !open;
    if (icon) icon.textContent = open ? "−" : "+";
  }

  function initAccordion() {
    document.querySelectorAll("[data-accordion]").forEach((accordion) => {
      accordion.querySelectorAll(".accordion__item button").forEach((button) => {
        button.addEventListener("click", () => {
          const item = button.closest(".accordion__item");
          if (!item) return;
          const shouldOpen = !item.classList.contains("is-open");
          accordion.querySelectorAll(".accordion__item").forEach((candidate) => {
            setPanelOpen(candidate, candidate === item && shouldOpen);
          });
        });
      });
    });
  }

  function initSportChoice() {
    const chips = document.querySelectorAll(".sport-choice__chip");
    chips.forEach((chip) => {
      chip.addEventListener("click", () => {
        if (chip.classList.contains("is-disabled")) return;
        selectedSport = chip.dataset.sport || selectedSport;
        chips.forEach((item) => {
          const active = item === chip;
          item.classList.toggle("is-active", active);
          item.setAttribute("aria-checked", String(active));
        });
      });
    });
  }

  function isValidTelegram(value) {
    const handle = value
      .trim()
      .replace(/^https?:\/\/t\.me\//i, "")
      .replace(/^@/, "");
    return /^[a-zA-Z0-9_]{5,32}$/.test(handle);
  }

  function initForms() {
    document.querySelectorAll("[data-signup-form]").forEach((form) => {
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const field = form.querySelector('input[name="tg"]');
        const status = form.querySelector("[data-form-status]");
        const value = field ? field.value.trim() : "";

        if (!isValidTelegram(value)) {
          if (status) status.textContent = "Впиши ник в Telegram — например, @ivan_play.";
          if (field) {
            field.setAttribute("aria-invalid", "true");
            field.focus();
          }
          return;
        }

        if (field) field.setAttribute("aria-invalid", "false");
        form.innerHTML =
          '<p class="form-status form-status--success">Готово! Напишем тебе в Telegram в течение суток — пара вопросов про уровень и удобное время, и закинем в группу к своим.</p>';
      });
    });
  }

  splitText();
  initTypewriter();
  initReveal();
  initMenu();
  initAnchors();
  initAccordion();
  initSportChoice();
  initForms();
  updateHeaderNow();

  window.addEventListener("scroll", scheduleHeaderUpdate, { passive: true });
  window.addEventListener("resize", scheduleHeaderUpdate);
})();
