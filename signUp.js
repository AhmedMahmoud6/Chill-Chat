import {
  isValidFullName,
  isValidEmail,
  isValidPassword,
  checkPasswordLength,
  validateFields,
} from "./functions.js";

import { signUpWithEmail } from "./firebase-auth.js";

let fullName = document.querySelector(".full-name");
let fullNameError = document.querySelector(".full-name-error");
let email = document.querySelector(".email-sign-up");
let emailError = document.querySelector(".email-sign-up-error");
let password = document.querySelector(".pass-sign-up");
let passwordError = document.querySelector(".pass-sign-up-error");
let signUpButton = document.querySelector(".sign-up");
let signUpPassed = document.querySelector(".sign-up-passed");

signUpButton.addEventListener("click", async () => {
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
    signUpPassed.textContent = "Creating your account.";
    signUpPassed.classList.remove("hidden");
    let result = await signUpWithEmail(email.value, password.value);

    // account created
    if (result.success) {
      signUpPassed.textContent = "Access Granted Successfully.";
      signUpPassed.classList.remove("hidden");
      signUpPassed.classList.add("text-green-400");
      console.log(result.message);
      setTimeout(() => {
        window.location.replace("index.html");
      }, 1000);
    } else {
      signUpPassed.textContent = "Unable to create account";
      signUpPassed.classList.add("text-red-400");
      signUpPassed.classList.remove("hidden");
      console.log(result.message);
    }
  }
});
