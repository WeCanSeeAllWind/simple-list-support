// REVIEWED: 표시 설정만 변경하며 저장·추적·외부 요청을 만들지 않는다.
document.getElementById("theme").addEventListener("change", (event) => {
  if (event.target.value === "system") {
    delete document.documentElement.dataset.theme;
  } else {
    document.documentElement.dataset.theme = event.target.value;
  }
});
