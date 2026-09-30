// atmosphere: cursor glow + slow fades (styles in atmosphere.css).
// loaded in <head> so html.fx is set before content paints (no flash).
(function () {
  var root = document.documentElement;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) return;

  var canFade = "IntersectionObserver" in window;
  if (canFade) root.classList.add("fx");

  document.addEventListener("DOMContentLoaded", function () {
    if (canFade) {
      try { setupFades(); } catch (e) { root.classList.remove("fx"); }
    }
    // pages with their own light (the homepage torch) skip the glow
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches && !document.querySelector(".torch")) setupGlow();
  });

  // fade + slight rise as elements enter the viewport, once each
  function setupFades() {
    var targets = document.querySelectorAll("main > *, .stage, img:not(.hero-art)");
    var io = new IntersectionObserver(function (entries) {
      var batch = 0;
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        io.unobserve(el);
        var delay = Math.min(batch++ * 90, 450); // gentle stagger for things visible together
        el.style.transitionDelay = delay + "ms";
        el.classList.add("fx-in");
        setTimeout(function () {
          el.classList.add("fx-done");
          el.classList.remove("fx-in");
          el.style.transitionDelay = "";
        }, delay + 1050);
      });
    }, { threshold: 0.12 });
    targets.forEach(function (el) { io.observe(el); });
  }

  // soft warm light that trails the cursor
  function setupGlow() {
    var glow = document.createElement("div");
    glow.className = "fx-glow";
    glow.setAttribute("aria-hidden", "true");
    document.body.appendChild(glow);

    var x = 0, y = 0, tx = 0, ty = 0;
    var running = false, seen = false;

    function tick() {
      x += (tx - x) * 0.12;
      y += (ty - y) * 0.12;
      glow.style.transform = "translate3d(" + x + "px," + y + "px,0)";
      if (Math.abs(tx - x) > 0.3 || Math.abs(ty - y) > 0.3) {
        requestAnimationFrame(tick);
      } else {
        running = false;
      }
    }

    document.addEventListener("mousemove", function (e) {
      tx = e.clientX;
      ty = e.clientY;
      if (!seen) { x = tx; y = ty; seen = true; } // appear under the cursor, don't sweep in from a corner
      glow.classList.add("fx-on");
      if (!running) { running = true; requestAnimationFrame(tick); }
    }, { passive: true });

    // fade out when the cursor leaves the window (or enters an embed like spotify)
    document.addEventListener("mouseout", function (e) {
      if (!e.relatedTarget) glow.classList.remove("fx-on");
    });
  }
})();
