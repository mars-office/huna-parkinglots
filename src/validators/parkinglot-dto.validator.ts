import * as yup from 'yup';

export const parkingLotDtoValidator = yup.object({
  name: yup.string().required(),
  lat: yup.number().required(),
  lng: yup.number().required()
});