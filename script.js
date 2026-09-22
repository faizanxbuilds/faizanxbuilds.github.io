// Theme toggle (persisted), scroll reveal, footer year
(function () {
  // Pin to top on load: stops the browser's scroll-restoration +
  // smooth-scroll combo from auto-scrolling shortly after load.
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  window.scrollTo(0, 0);

  var root = document.documentElement;
  var btn = document.getElementById("themeToggle");

  try {
    var saved = localStorage.getItem("fp-theme");
    if (saved === "light" || saved === "dark") root.setAttribute("data-theme", saved);
  } catch (e) {}

  function sync() {
    var dark = root.getAttribute("data-theme") === "dark";
    btn.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
    btn.setAttribute("title", dark ? "Switch to light mode" : "Switch to dark mode");
  }

  btn.addEventListener("click", function () {
    var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("fp-theme", next); } catch (e) {}
    sync();
  });
  sync();

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });
})();
