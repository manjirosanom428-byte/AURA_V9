(function () {
  const originalFetch = window.fetch.bind(window);
  window.fetch = function (input, init) {
    const url = typeof input === "string" ? input : (input && input.url) || "";
    let parsed;
    try { parsed = new URL(url, window.location.href); } catch (_) {}
    const isApi = parsed && parsed.pathname.startsWith("/api/");
    if (!isApi || parsed.pathname === "/api/login" || parsed.pathname === "/api/register" || parsed.pathname === "/api/test") {
      return originalFetch(input, init);
    }
    const token = localStorage.getItem("auraToken");
    const headers = new Headers((init && init.headers) || (input instanceof Request ? input.headers : undefined));
    if (token) headers.set("Authorization", "Bearer " + token);
    const nextInit = Object.assign({}, init || {}, { headers });
    return originalFetch(input, nextInit).then(function (response) {
      if (response.status === 401 && !/\/api\/logout$/.test(parsed.pathname)) {
        localStorage.removeItem("auraUser");
        localStorage.removeItem("auraToken");
        if (!/login\.html$/.test(window.location.pathname)) window.location.replace("./login.html");
      }
      return response;
    });
  };
})();
