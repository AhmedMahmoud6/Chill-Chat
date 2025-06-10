import {
  isValidFullName,
  isValidEmail,
  isValidPassword,
  checkPasswordLength,
  validateFields,
} from "./functions.js";

import {
  signUpWithEmail,
  getFriendlyErrorMessage,
  observeAuthState,
  setDocument,
} from "./firebase-auth.js";

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

      // creating users details in firebase
      await setDocument("users", email.value, {
        name: fullName.value,
        email: email.value,
        profilePic:
          "https://i.pinimg.com/736x/e6/e4/df/e6e4df26ba752161b9fc6a17321fa286.jpg",
      });

      observeAuthState((user) => {
        if (user)
          setTimeout(() => {
            window.location.replace("main.html");
          }, 1000);
      });
    } else {
      signUpPassed.textContent = getFriendlyErrorMessage(result.message);
      signUpPassed.classList.add("text-red-400");
      signUpPassed.classList.remove("hidden");
    }
  }
});
