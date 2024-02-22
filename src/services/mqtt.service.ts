import mqtt from "mqtt";
import { StatusUpdateDto } from "../dto/status-update.dto";
import statusService from "./status.service";

export const mqttClient = mqtt.connect({
  protocol: "mqtts",
  hostname: "huna-emqx",
  port: 8883,
  ca: process.env.EMQX_CA_CRT,
  cert: process.env.EMQX_CLIENT_CRT,
  clean: true,
  key: process.env.EMQX_CLIENT_KEY,
  protocolVersion: 5,
  clientId: process.env.HOSTNAME ||
    "huna-parkinglots_" + Math.random().toString(16).substr(2, 8),
});

mqttClient.on("connect", () => {
  console.log("MQTT connected");
  mqttClient.subscribe("$share/main/status/+", {
    qos: 0
  });
});

mqttClient.on("reconnect", () => {
  console.log("MQTT reconnected");
  mqttClient.subscribe("$share/main/status/+", {
    qos: 0
  });
});

mqttClient.on("disconnect", () => {
  console.log("MQTT disconnected");
});

mqttClient.on("close", () => {
  console.log("MQTT closed");
});

mqttClient.on("message", (topic, payload) => {
  (async () => {
    try {
      const payloadString = payload?.toString();
      console.log(`MQTT message received on topic ${topic}: ${payloadString}`);
      const lowerTopic = topic.toLowerCase();
      if (lowerTopic.startsWith("status/")) {
        const statusUpdateDto: StatusUpdateDto = payloadString
          ? JSON.parse(payloadString)
          : undefined;
        await statusService.processStatusUpdate(statusUpdateDto);
        return;
      }
    } catch (err) {
      console.error(err);
    }
  })();
});
