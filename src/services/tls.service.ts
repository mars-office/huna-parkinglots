import forge from "node-forge";
import crypto from "crypto";

export const tlsService = {
  generateIotClientCertificate: (commonName: string) => {
    const caCert = forge.pki.certificateFromPem(process.env.IOT_CA_CRT!);
    const caKey = forge.pki.privateKeyFromPem(process.env.IOT_CA_KEY!);
    const keys = forge.pki.rsa.generateKeyPair(3072);
    const clientKey = keys.privateKey;

    const clientCert = forge.pki.createCertificate();
    clientCert.publicKey = keys.publicKey;
    clientCert.serialNumber = "01" + crypto.randomBytes(19).toString("hex");
    clientCert.validity.notBefore = new Date();
    clientCert.validity.notAfter = new Date();
    clientCert.validity.notAfter.setFullYear(
      clientCert.validity.notBefore.getFullYear() + 50
    );
    clientCert.setIssuer(caCert.subject.attributes);
    clientCert.setSubject([
      { shortName: "CN", value: commonName },
      { shortName: "O", value: "Huna" },
      { shortName: "OU", value: "IOT" },
    ]);
    clientCert.setExtensions([
      { name: "basicConstraints", cA: false },
      {
        name: "keyUsage",
        keyCertSign: false,
        digitalSignature: true,
        keyEncipherment: true,
      },
      { name: "extKeyUsage", serverAuth: false, clientAuth: true },
      {
        name: "authorityKeyIdentifier",
        authorityCertIssuer: true,
        serialNumber: caCert.serialNumber,
      },
    ]);
    clientCert.sign(caKey, forge.md.sha256.create());
    const clientCertPem = forge.pki.certificateToPem(clientCert);
    const clientKeyPem = forge.pki.privateKeyToPem(clientKey);

    return { clientCertPem, clientKeyPem };
  },
};

export default tlsService;
