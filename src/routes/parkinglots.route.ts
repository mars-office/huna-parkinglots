import { Request, Response, Router } from "express";
import db from "../services/mongodb.service";
import { ObjectId } from "mongodb";
import { ParkingLotEntity } from "../entities/parking-lot.entity";
import { ParkingLotDto } from "../dto/parking-lot.dto";
import tlsService from "../services/tls.service";

const parkinglotsRouter = Router();

parkinglotsRouter.get(
  "/api/parkinglots/admin/parkinglots",
  async (req: Request, res: Response) => {
    const page = req.query.page ? +req.query.page : 1;
    const elements = req.query.elements ? +req.query.elements : 10;
    const parkingLotsList = await db
      .collection<ParkingLotEntity>("parkinglots")
      .find()
      .project<ParkingLotEntity>({ name: 1, lat: 1, lng: 1 })
      .sort({ name: 1 })
      .skip((page - 1) * elements)
      .limit(elements)
      .toArray();
    res.send(
      parkingLotsList.map(
        (x) => ({ ...x, _id: x._id.toString() } as ParkingLotDto)
      )
    );
  }
);

parkinglotsRouter.get(
  "/api/parkinglots/admin/parkinglots/:id",
  async (req: Request, res: Response) => {
    const id = req.params.id;
    const parkingLot = await db
      .collection<ParkingLotEntity>("parkinglots")
      .findOne(
        { _id: new ObjectId(id) },
        {
          projection: {
            name: 1,
            lat: 1,
            lng: 1,
          },
        }
      );
    if (parkingLot == null) {
      res.status(404).send({ error: "Not found" });
      return;
    }
    res.send({
      ...parkingLot,
      _id: parkingLot._id.toString(),
    } as ParkingLotDto);
  }
);

parkinglotsRouter.post(
  "/api/parkinglots/admin/parkinglots",
  async (req: Request, res: Response) => {
    const dto: ParkingLotDto = req.body;

    if (!dto.name || dto.name.length === 0) {
      res.status(400).send({ error: "Name is required" });
      return;
    }

    if (!dto.lat) {
      res.status(400).send({ error: "Latitude is required" });
      return;
    }

    if (!dto.lng) {
      res.status(400).send({ error: "Longitude is required" });
      return;
    }

    const newId = new ObjectId();
    const clientCertificate = tlsService.generateIotClientCertificate(
      newId.toString()
    );
    const entity: ParkingLotEntity = {
      lat: dto.lat,
      lng: dto.lng,
      name: dto.name,
      _id: newId,
      clientCertificateCrt: clientCertificate.clientCertPem,
      clientCertificateKey: clientCertificate.clientKeyPem,
    };

    const insertResult = await db
      .collection<ParkingLotEntity>("parkinglots")
      .insertOne(entity);

    res.send({ ...entity, _id: insertResult.insertedId.toString() });
  }
);

export default parkinglotsRouter;
