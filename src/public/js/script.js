let menu = document.querySelector("#menu-icon");
let navlist = document.querySelector(".navlist");

let sign_in_btn = document.querySelector("#sign-in-btn");
let sign_up_btn = document.querySelector("#sign-up-btn");
let container = document.querySelector(".container");

menu.onclick = () => {
  menu.classList.toggle("bx-x");
  navlist.classList.toggle("open");
};

const sr = ScrollReveal({
  distance: "65px",
  duration: 2600,
  delay: 450,
  reset: true,
});

sr.reveal(".hero-text", { delay: 200, origin: "top" });
sr.reveal(".hero-img", { delay: 450, origin: "top" });
sr.reveal(".hero-contact", { delay: 450, origin: "top" });
sr.reveal(".icons", { delay: 450, origin: "left" });
sr.reveal(".scroll-down", { delay: 450, origin: "right" });

// Contact
const form = document.querySelector("[data-form]");
const formInputs = document.querySelectorAll("[data-form-input]");
const formBtn = document.querySelector("[data-form-btn]");

for (let i = 0; i < formInputs.length; i++) {
  formInputs[i].addEventListener("input", function () {
    if (form.checkValidity()) {
      formBtn.removeAttribute("disabled");
    } else {
      formBtn.setAttribute("disabled", "");
    }
  });
}
