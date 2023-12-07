import { ValidationError } from "yup";

export const extractErrorsFromYupException = (err: ValidationError) => {
  const result: {[key: string]: string[]} = {};
  for (let error of err.inner) {
    if (!error.path || !error.errors || error.errors.length === 0) {
      continue;
    }
    result[error.path!] = error.errors;
  }
  return result;
}