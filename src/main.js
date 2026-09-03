const header = document.querySelector(".site-header");
const toggle = document.querySelector(".nav-toggle");
const nav = document.querySelector("#site-nav");
const mobileQuery = window.matchMedia("(max-width: 819px)");

const setHeaderState = () => {
  if (header) {
    header.dataset.scrolled = String(window.scrollY > 8);
  }
};

setHeaderState();
window.addEventListener("scroll", setHeaderState, { passive: true });

if (toggle && nav) {
  const navLinks = Array.from(nav.querySelectorAll("a"));

  const setNavA11y = (open) => {
    const mobile = mobileQuery.matches;
    nav.setAttribute("aria-hidden", String(mobile && !open));
    nav.inert = Boolean(mobile && !open);
    navLinks.forEach((link) => {
      if (mobile && !open) {
        link.setAttribute("tabindex", "-1");
      } else {
        link.removeAttribute("tabindex");
      }
    });
  };

  const setOpen = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    nav.dataset.open = String(open);
    toggle.querySelector(".visually-hidden").textContent = open ? "Menue schliessen" : "Menue oeffnen";
    setNavA11y(open);
  };

  setNavA11y(false);

  toggle.addEventListener("click", () => {
    setOpen(toggle.getAttribute("aria-expanded") !== "true");
  });

  nav.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement && mobileQuery.matches) {
      setOpen(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
      setOpen(false);
      toggle.focus();
    }
  });

  mobileQuery.addEventListener("change", () => {
    setOpen(false);
  });
}
