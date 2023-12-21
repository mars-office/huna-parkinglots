import { ObjectId } from "mongodb";
import { StatusEntity } from "./status.entity";

export interface ParkingLotEntity {
  _id: ObjectId;
  name: string;
  lat: number;
  lng: number;
  clientCertificateCrt: string;
  clientCertificateKey: string;
  status?: StatusEntity;
  lastStatusTimestamp?: number;
}