export const MIN_PASSWORD_LENGTH = 12;

export const validateStrongPassword = (password, variableName = "Password") => {
  if (!password) throw new Error(variableName + " is required");
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(variableName + " must be at least " + MIN_PASSWORD_LENGTH + " characters");
  }
};