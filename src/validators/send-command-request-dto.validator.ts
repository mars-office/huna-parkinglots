import * as yup from 'yup';

export const sendCommandRequestDtoValidator = yup.object({
  command: yup.string().required().oneOf(["reboot", "otacheck"]),
});