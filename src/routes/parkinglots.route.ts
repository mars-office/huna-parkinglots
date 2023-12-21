import { Request, Response, Router } from "express";
import db from "../services/mongodb.service";
import { ObjectId } from "mongodb";
import { ParkingLotEntity } from "../entities/parking-lot.entity";
import { ParkingLotDto } from "../dto/parking-lot.dto";
import tlsService from "../services/tls.service";
import { DownloadCertificateBundleResponseDto } from "../dto/download-certificate-bundle-response.dto";
import { parkingLotDtoValidator } from "../validators/parkinglot-dto.validator";
import { ValidationError } from "yup";
import { extractErrorsFromYupException } from "../helpers/validation.helper";
import { SendCommandRequestDto } from "../dto/send-command-request.dto";
import { SendCommandResponseDto } from "../dto/send-command-response.dto";
import { sendCommandRequestDtoValidator } from "../validators/send-command-request-dto.validator";
import { mqttClient } from "../services/mqtt.service";

const parkinglotsRouter = Router();

parkinglotsRouter.get(
  "/api/parkinglots/admin/parkinglots",
  async (req: Request, res: Response) => {
    const parkingLotsList = await db
      .collection<ParkingLotEntity>("parkinglots")
      .find()
      .project<ParkingLotEntity>({ name: 1, lat: 1, lng: 1, status: 1, lastStatusTimestamp: 1 })
      .sort({ name: 1 })
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
    const id = new ObjectId(req.params.id);

    const entity = await db
      .collection<ParkingLotEntity>("parkinglots")
      .findOne({ _id: id });

    if (!entity) {
      res.status(404).send({ global: ["api.validation.notFound"] });
      return;
    }

    res.send({
      name: entity.name,
      lat: entity.lat,
      lng: entity.lng,
      _id: entity._id.toString(),
      status: entity.status,
      lastStatusTimestamp: entity.lastStatusTimestamp
    } as ParkingLotDto);
  }
);

parkinglotsRouter.get(
  "/api/parkinglots/admin/parkinglots/:id/certificate",
  async (req: Request, res: Response) => {
    const id = req.params.id;
    const parkingLot = await db
      .collection<ParkingLotEntity>("parkinglots")
      .findOne(
        { _id: new ObjectId(id) },
        {
          projection: {
            clientCertificateCrt: 1,
            clientCertificateKey: 1
          },
        }
      );
    if (parkingLot == null) {
      res.status(404).send({ global: ["api.validation.notFound"] });
      return;
    }
    
    res.send({
      _id: parkingLot._id.toString(),
      clientCertificateCrt: parkingLot.clientCertificateCrt,
      clientCertificateKey: parkingLot.clientCertificateKey,
      caCrt: process.env.IOT_CA_CRT!,
    } as DownloadCertificateBundleResponseDto);
  }
);

parkinglotsRouter.post(
  "/api/parkinglots/admin/parkinglots",
  async (req: Request, res: Response) => {
    const dto: ParkingLotDto = req.body;

    try {
      await parkingLotDtoValidator.validate(dto, {abortEarly: false});
    } catch (err) {
      if (!(err instanceof ValidationError)) {
        throw new Error('Not a validation error');
      }
      res.status(400).send(extractErrorsFromYupException(err));
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

    res.send({
      name: entity.name,
      lat: entity.lat,
      lng: entity.lng,
      _id: insertResult.insertedId.toString(),
    } as ParkingLotDto);
  }
);

parkinglotsRouter.post(
  "/api/parkinglots/admin/parkinglots/:id/command",
  async (req: Request, res: Response) => {
    const dto: SendCommandRequestDto = req.body;
    try {
      await sendCommandRequestDtoValidator.validate(dto, {abortEarly: false});
    } catch (err) {
      if (!(err instanceof ValidationError)) {
        throw new Error('Not a validation error');
      }
      res.status(400).send(extractErrorsFromYupException(err));
      return;
    }
    
    const id = new ObjectId(req.params.id!);
    const entityExists = (await db.collection<ParkingLotEntity>("parkinglots")
      .countDocuments({_id: id})) > 0;

    if (!entityExists) {
      res.status(404).send({ global: ["api.validation.notFound"] });
      return;
    }

    mqttClient.publishAsync(`commands/${req.params.id!}`, dto.command, {
      qos: 1
    });

    res.send({
      command: dto.command,
      _id: req.params.id!,
      successful: true
    } as SendCommandResponseDto);
  }
);

parkinglotsRouter.put(
  "/api/parkinglots/admin/parkinglots/:id",
  async (req: Request, res: Response) => {
    const dto: Partial<ParkingLotDto> = req.body;
    const updateObject: any = {};
    if (dto.name && dto.name.length > 0) {
      updateObject.name = dto.name;
    }
    if (dto.lat) {
      updateObject.lat = dto.lat;
    }
    if (dto.lng) {
      updateObject.lng = dto.lng;
    }
    const id = new ObjectId(req.params.id);
    const entity = await db
      .collection<ParkingLotEntity>("parkinglots")
      .findOneAndUpdate(
        { _id: id },
        {
          $set: updateObject,
        }
      );

    if (entity == null) {
      res.status(404).send({ global: ["api.validation.notFound"] });
      return;
    }

    res.send({
      name: entity.name,
      lat: entity.lat,
      lng: entity.lng,
      _id: entity._id.toString(),
      lastStatusTimestamp: entity.lastStatusTimestamp,
      status: entity.status,
      ...updateObject,
    } as ParkingLotDto);
  }
);

parkinglotsRouter.put(
  "/api/parkinglots/admin/parkinglots/:id/regenerate",
  async (req: Request, res: Response) => {
    const id = new ObjectId(req.params.id);

    const clientCertificate = tlsService.generateIotClientCertificate(
      id.toString()
    );

    const updateObject = {
      clientCertificateCrt: clientCertificate.clientCertPem,
      clientCertificateKey: clientCertificate.clientKeyPem,
    };

    const entity = await db
      .collection<ParkingLotEntity>("parkinglots")
      .findOneAndUpdate(
        { _id: id },
        {
          $set: updateObject,
        }
      );

    if (entity == null) {
      res.status(404).send({ global: ["api.validation.notFound"] });
      return;
    }

    res.send({
      name: entity.name,
      lat: entity.lat,
      lng: entity.lng,
      _id: entity._id.toString(),
      status: entity.status,
      lastStatusTimestamp: entity.lastStatusTimestamp
    } as ParkingLotDto);
  }
);

parkinglotsRouter.delete(
  "/api/parkinglots/admin/parkinglots/:id",
  async (req: Request, res: Response) => {
    const id = new ObjectId(req.params.id);

    const entity = await db
      .collection<ParkingLotEntity>("parkinglots")
      .findOne({ _id: id });

    if (!entity) {
      res.status(404).send({ global: ["api.validation.notFound"] });
      return;
    }

    await db.collection<ParkingLotEntity>("parkinglots").deleteOne({ _id: id });

    res.send({
      name: entity.name,
      lat: entity.lat,
      lng: entity.lng,
      _id: entity._id.toString(),
      status: entity.status,
      lastStatusTimestamp: entity.lastStatusTimestamp
    } as ParkingLotDto);
  }
);

export default parkinglotsRouter;
