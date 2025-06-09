export function isValidFullName(name) {
  const regex = /^[A-Za-z][A-Za-z\s'-]{1,}$/;
  return regex.test(name.trim());
}

export function isValidEmail(email) {
  const regex = /^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email);
}

export function isValidPassword(password) {
  const regex = /^.{6,13}$/;
  return regex.test(password);
}

export function checkPasswordLength(password) {
  const minLength = 6;
  const maxLength = 13;

  if (password.length < minLength) {
    return "Minimum 6 characters required.";
  } else if (password.length > maxLength) {
    return "Maximum 13 characters allowed.";
  } else {
    return "Password length is valid.";
  }
}

export function validateFields(
  isValidField,
  fieldName,
  fieldNameError,
  errMsg = "Invalid Field"
) {
  // if not valid full name
  if (!isValidField(fieldName.value)) {
    fieldName.classList.add("outline-red-400");
    fieldNameError.textContent = errMsg;
    fieldNameError.classList.remove("hidden");
    return false;
  } else {
    fieldName.classList.remove("outline-red-400");
    fieldNameError.classList.add("hidden");
    return true;
  }
}
