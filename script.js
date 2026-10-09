const menuButton = document.querySelector(".menu-toggle");
const navigation = document.getElementById("navigation");

function closeMenu() {
  navigation.classList.remove("open");
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "Open navigation");
}
menuButton.addEventListener("click", () => {
  const open = navigation.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.setAttribute(
    "aria-label",
    open ? "Close navigation" : "Open navigation",
  );
});
navigation
  .querySelectorAll("a")
  .forEach((link) => link.addEventListener("click", closeMenu));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && navigation.classList.contains("open")) {
    closeMenu();
    menuButton.focus();
  }
});
window.matchMedia("(min-width: 761px)").addEventListener("change", (event) => {
  if (event.matches) closeMenu();
});

const sections = [...document.querySelectorAll("main > section[id]")];
const navLinks = [...navigation.querySelectorAll("a")];
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      const current = entries.find((entry) => entry.isIntersecting);
      if (!current) return;
      navLinks.forEach((link) => {
        const active = link.hash === `#${current.target.id}`;
        link.classList.toggle("active", active);
        if (active) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    },
    { rootMargin: "-15% 0px -65% 0px", threshold: 0 },
  );
  sections.forEach((section) => observer.observe(section));
}

document.getElementById("year").textContent = new Date().getFullYear();
document.getElementById("copy-email").addEventListener("click", async () => {
  const status = document.getElementById("copy-status");
  try {
    await navigator.clipboard.writeText("abhilekhkoirala@gmail.com");
    status.textContent = "Email address copied.";
  } catch {
    status.textContent =
      "Please use the email link above, or copy abhilekhkoirala@gmail.com.";
  }
});
