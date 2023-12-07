import { ObjectId } from "mongodb";

export interface ParkingLotEntity {
  _id: ObjectId;
  name: string;
  lat: number;
  lng: number;
  clientCertificateCrt: string;
  clientCertificateKey: string;
}