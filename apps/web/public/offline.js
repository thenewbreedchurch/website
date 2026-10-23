// Offline page behaviour (a separate file because the site's CSP blocks inline scripts).
// Once the site is reachable again, send the visitor back where they were: when this page was
// shown as a fallback its URL is still the page they asked for, so a reload is enough; if
// someone opens /offline.html directly, go to the home page instead.
function backOnline() {
  if (window.location.pathname === "/offline.html") {
    window.location.replace("/");
  } else {
    window.location.reload();
  }
}

function checkConnection() {
  // Not a page navigation, so the service worker doesn't intercept it — this really hits the network.
  return fetch("/", { method: "HEAD", cache: "no-store" })
    .then(function (res) {
      if (res.ok) backOnline();
    })
    .catch(function () {});
}

document.getElementById("retry").addEventListener("click", checkConnection);
window.addEventListener("online", checkConnection);
// The browser's "online" event is unreliable (it doesn't fire when only the site is down), so poll too.
checkConnection();
setInterval(checkConnection, 4000);
