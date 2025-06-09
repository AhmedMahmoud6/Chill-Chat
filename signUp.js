import {
  isValidFullName,
  isValidEmail,
  isValidPassword,
  checkPasswordLength,
  validateFields,
} from "./functions.js";

let fullName = document.querySelector(".full-name");
let fullNameError = document.querySelector(".full-name-error");
let email = document.querySelector(".email-sign-up");
let emailError = document.querySelector(".email-sign-up-error");
let password = document.querySelector(".pass-sign-up");
let passwordError = document.querySelector(".pass-sign-up-error");
let signUpButton = document.querySelector(".sign-up");
let signUpPassed = document.querySelector(".sign-up-passed");

signUpButton.addEventListener("click", () => {
  if (
    // validate full name
    validateFields(
      isValidFullName,
      fullName,
      fullNameError,
      "Invalid Full Name"
    ) &&
    // validate email address
    validateFields(isValidEmail, email, emailError, "Invalid email address") &&
    // validate password
    validateFields(
      isValidPassword,
      password,
      passwordError,
      checkPasswordLength(password.value)
    )
  ) {
    signUpPassed.classList.remove("hidden");
    setTimeout(() => {
      window.location.replace("index.html");
    }, 1000);
  }
});
