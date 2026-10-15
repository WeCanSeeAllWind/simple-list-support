/* REVIEWED: 초대 토큰은 기기 앱으로만 전달한다. 설치 이동에는 토큰을 포함하지 않는다. */
"use strict";
const copy = {
  en: {open: "Open Simple List", missing: "Open the invitation link you received.", invalid: "This invitation link is invalid. Ask the sender for a new link."},
  ko: {open: "Simple List에서 열기", missing: "받으신 초대 링크를 열어 주세요.", invalid: "유효하지 않은 초대 링크입니다. 보낸 사람에게 새 링크를 요청해 주세요."},
  ja: {open: "Simple Listで開く", missing: "受け取った招待リンクを開いてください。", invalid: "無効な招待リンクです。送信者に新しいリンクを依頼してください。"}
};
const appStoreURL = "https://apps.apple.com/app/id6821897497";
let fallbackTimer;
function cancelFallback() { clearTimeout(fallbackTimer); fallbackTimer = undefined; }

function validToken(hash) {
  if (!/^#v1\.[A-Za-z0-9_-]+$/.test(hash) || hash.length > 5501) return false;
  try {
    const token = hash.slice(4).replace(/-/g, "+").replace(/_/g, "/");
    const binary = atob(token + "=".repeat((4 - token.length % 4) % 4));
    const text = new TextDecoder("utf-8", {fatal: true}).decode(Uint8Array.from(binary, c => c.charCodeAt(0)));
    const url = new URL(text);
    return new TextEncoder().encode(text).length <= 4096 && url.protocol === "https:" &&
      ["icloud.com", "www.icloud.com"].includes(url.hostname) && !url.username && !url.password &&
      (!url.port || url.port === "443") && url.pathname.startsWith("/share/") && url.pathname.length > 7;
  } catch { return false; }
}

function render() {
  cancelFallback();
  const language = navigator.language.toLowerCase().split("-")[0];
  const selected = copy[language] ? language : "en", values = copy[selected];
  document.documentElement.lang = selected;
  const valid = validToken(location.hash), open = document.getElementById("open");
  open.textContent = values.open;
  open.hidden = !valid;
  if (valid) open.href = "simplelist://invite/" + location.hash;
  else open.removeAttribute("href");
  document.getElementById("status").textContent = valid ? "" : location.hash ? values.invalid : values.missing;
}
render();
document.getElementById("open").addEventListener("click", event => {
  // 키보드/탭에서도 현재 링크를 검증한다. 앱 전환 시 예약된 스토어 이동을 취소한다.
  if (!validToken(location.hash)) { event.preventDefault(); render(); return; }
  cancelFallback();
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const started = Date.now();
  fallbackTimer = setTimeout(() => {
    fallbackTimer = undefined;
    // 앱에서 돌아온 뒤 멈췄던 타이머가 뒤늦게 스토어를 열지 않게 한다.
    if (!document.hidden && Date.now() - started < 10000) location.replace(appStoreURL);
  }, 2200);
});
document.addEventListener("visibilitychange", () => { if (document.hidden) cancelFallback(); });
window.addEventListener("pagehide", cancelFallback);
window.addEventListener("hashchange", render);
