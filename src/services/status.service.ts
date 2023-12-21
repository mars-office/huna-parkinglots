import { ObjectId } from "mongodb";
import { StatusUpdateDto } from "../dto/status-update.dto";
import { ParkingLotEntity } from "../entities/parking-lot.entity";
import { StatusEntity } from "../entities/status.entity";
import db from "./mongodb.service";

export const statusService = {
  processStatusUpdate: async (dto: StatusUpdateDto) => {
    const id = new ObjectId(dto.id);
    const statusEntity: StatusEntity = {
      cpufreq: dto.cpufreq,
      freeheap: dto.freeheap,
      localtime: dto.localtime,
      modemimei: dto.modemimei,
      modemvlt: dto.modemvlt,
      signal: dto.signal,
      simserial: dto.simserial,
      uptimemillis: dto.uptimemillis,
      version: dto.version
    };
    const currentMillis = new Date().getTime();
    const updateObject: Partial<ParkingLotEntity> = {
      status: statusEntity,
      lastStatusTimestamp: currentMillis
    };
    await db
      .collection<ParkingLotEntity>("parkinglots")
      .updateOne(
        { _id: id },
        {
          $set: updateObject,
        }
      );
    console.log("Successful status update for " + dto.id);
  }
};

export default statusService;