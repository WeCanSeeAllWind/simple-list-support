/* REVIEWED: 초대 토큰은 브라우저에서만 해석하며 외부 요청·로그·분석에 전달하지 않는다. */
"use strict";
const copy = {
  en: {
    title: "Open your invitation in Simple List", intro: "Check the invitation in the app. Lists from connected friends are added automatically. An iCloud web login is not required.",
    open: "Open Simple List", missing: "Open the complete invitation link you received.", invalid: "This invitation link is invalid. Ask the sender for a new link.",
    browser: "If your chat opens a browser, use the button above or choose Open in Safari from the browser menu.",
    "install-title": "Need the app?", "install-note": "Install Simple List on this device, then reopen the invitation link you received.",
    "account-title": "Your iCloud account", "account-note": "Use the device’s Apple account that received the invitation. If it was sent to another account, ask the sender to invite your current account. Each participant needs Premium.",
    expired: "If the invitation expired or was cancelled, ask the sender for a new one.", "language-label": "Language", support: "Support", privacy: "Privacy"
  },
  ko: {
    title: "초대를 Simple List에서 확인하세요", intro: "앱에서 초대를 확인하세요. 이미 연결된 친구의 목록은 자동으로 추가됩니다. iCloud 웹 로그인은 필요하지 않습니다.",
    open: "Simple List에서 열기", missing: "받으신 초대 링크 전체를 다시 열어 주세요.", invalid: "유효하지 않은 초대 링크입니다. 보낸 사람에게 새 링크를 요청해 주세요.",
    browser: "대화방에서 웹페이지가 열렸다면 위 버튼을 누르거나 브라우저 메뉴의 Safari에서 열기를 선택해 주세요.",
    "install-title": "앱이 없으신가요?", "install-note": "이 기기에 Simple List를 설치한 뒤 받은 초대 링크를 다시 열어 주세요.",
    "account-title": "iCloud 계정 확인", "account-note": "초대를 받은 Apple 계정으로 기기에 로그인해 주세요. 다른 계정으로 받은 초대라면 현재 계정 이메일로 새 초대를 요청해 주세요. 참여자마다 프리미엄이 필요합니다.",
    expired: "만료되었거나 취소된 초대는 보낸 사람에게 새로 요청해 주세요.", "language-label": "언어", support: "지원", privacy: "개인정보처리방침"
  },
  ja: {
    title: "Simple Listで招待を確認", intro: "アプリで招待を確認してください。つながった友達のリストは自動で追加されます。iCloudのWebログインは不要です。",
    open: "Simple Listで開く", missing: "受け取った招待リンク全体を開き直してください。", invalid: "無効な招待リンクです。送信者に新しいリンクを依頼してください。",
    browser: "チャット内でWebページが開いた場合は上のボタン、またはブラウザメニューの「Safariで開く」を選んでください。",
    "install-title": "アプリが必要ですか？", "install-note": "このデバイスにSimple Listをインストールし、受け取った招待リンクを開き直してください。",
    "account-title": "iCloudアカウント", "account-note": "招待を受け取ったAppleアカウントでデバイスにサインインしてください。別のアカウント宛ての場合は現在のメール宛てに新しい招待を依頼してください。参加者それぞれにPremiumが必要です。",
    expired: "期限切れや取り消された招待は送信者に新しく依頼してください。", "language-label": "言語", support: "サポート", privacy: "プライバシー"
  }
};

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

function render(language) {
  const selected = copy[language] ? language : "en", values = copy[selected];
  document.documentElement.lang = selected;
  document.title = values.title + " · Simple List";
  for (const [id, text] of Object.entries(values)) {
    const element = document.getElementById(id);
    if (element) element.textContent = text;
  }
  document.getElementById("language").value = selected;
  const valid = validToken(location.hash), open = document.getElementById("open");
  open.hidden = !valid;
  if (valid) open.href = "simplelist://invite/" + location.hash;
  else open.removeAttribute("href");
  document.getElementById("status").textContent = valid ? "" : location.hash ? values.invalid : values.missing;
  document.getElementById("browser").hidden = !valid;
  const prefix = selected === "en" ? "../" : "../" + selected + "/";
  document.getElementById("support").href = prefix;
  document.getElementById("privacy").href = prefix + "privacy.html";
}
const preferred = navigator.language.toLowerCase().split("-")[0];
render(preferred);
document.getElementById("language").addEventListener("change", event => render(event.target.value));
window.addEventListener("hashchange", () => render(document.getElementById("language").value));
