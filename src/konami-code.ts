const code = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

let position = 0;

if (new Date() < new Date("2026-08-01")) {
  document.addEventListener("keydown", (event) => {
    if (event.key === code[position]) {
      position++;
      if (position === code.length) {
        alert("Konami Code Activated!");
        window.location.href = "https://aidenbecker.vercel.app/";
        position = 0;
      }
    } else {
      position = 0;
    }
  });
}
