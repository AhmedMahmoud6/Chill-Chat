import {
  isValidEmail,
  isValidPassword,
  checkPasswordLength,
  validateFields,
} from "./functions.js";

let email = document.querySelector(".email-sign-in");
let emailError = document.querySelector(".email-sign-in-error");
let password = document.querySelector(".pass-sign-in");
let passwordError = document.querySelector(".pass-sign-in-error");
let signInBtn = document.querySelector(".sign-in");
let signInValidationMsg = document.querySelector(".sign-in-validation");

signInBtn.addEventListener("click", () => {
  if (
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
    signInValidationMsg.textContent = "Logged In Successfully";
    signInValidationMsg.classList.replace("text-red-400", "text-green-400");
  } else {
    signInValidationMsg.textContent = "Unable to login";
    signInValidationMsg.classList.replace("text-green-400", "text-red-400");
  }
  signInValidationMsg.classList.remove("hidden");
});
