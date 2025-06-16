import {
  isValidEmail,
  isValidPassword,
  checkPasswordLength,
  validateFields,
  setUserOnline,
} from "./functions.js";

import {
  signInWithEmail,
  getFriendlyErrorMessage,
  observeAuthState,
  db,
  doc,
  updateDoc,
  serverTimestamp,
  ref,
  onDisconnect,
  set,
  rtdb,
} from "./firebase-auth.js";

let email = document.querySelector(".email-sign-in");
let emailError = document.querySelector(".email-sign-in-error");
let password = document.querySelector(".pass-sign-in");
let passwordError = document.querySelector(".pass-sign-in-error");
let signInBtn = document.querySelector(".sign-in");
let signInValidationMsg = document.querySelector(".sign-in-validation");

observeAuthState(async (user) => {
  if (user) {
    await setUserOnline(user.displayName.toLowerCase());
    window.location.replace("main.html");
  }
});

signInBtn.addEventListener("click", async () => {
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
    let result = await signInWithEmail(email.value, password.value);

    if (result.success) {
      signInValidationMsg.textContent = "Logged In Successfully";
      signInValidationMsg.classList.replace("text-red-400", "text-green-400");
      observeAuthState((user) => {
        if (user)
          setTimeout(() => {
            window.location.replace("main.html");
          }, 1000);
      });
    } else {
      signInValidationMsg.textContent = getFriendlyErrorMessage(result.message);
      signInValidationMsg.classList.replace("text-green-400", "text-red-400");
    }
  } else {
    signInValidationMsg.textContent = "Unable to login";
    signInValidationMsg.classList.replace("text-green-400", "text-red-400");
  }
  signInValidationMsg.classList.remove("hidden");
});
