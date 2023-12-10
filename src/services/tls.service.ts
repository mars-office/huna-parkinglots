import forge from "node-forge";

export const tlsService = {
  generateIotClientCertificate: (commonName: string) => {
    const caCert = forge.pki.certificateFromPem(process.env.IOT_CA_CRT!);
    const caKey = forge.pki.privateKeyFromPem(process.env.IOT_CA_KEY!);
    const keys = forge.pki.rsa.generateKeyPair(3072);
    const clientKey = keys.privateKey;
    const clientCertReq = forge.pki.createCertificationRequest();
    clientCertReq.publicKey = keys.publicKey;
    clientCertReq.setSubject([
      { name: "commonName", value: commonName },
      { name: 'organizationName', value: process.env.HUNA_SERVER_HOSTNAME!, type: 'organizationName' }
    ]);
    clientCertReq.sign(clientKey);
    const clientCert = forge.pki.createCertificate();
    clientCert.publicKey = clientCertReq.publicKey;
    clientCert.serialNumber = "01";
    clientCert.validity.notBefore = new Date();
    clientCert.validity.notAfter = new Date();
    clientCert.validity.notAfter.setFullYear(
      clientCert.validity.notBefore.getFullYear() + 50
    );
    clientCert.setIssuer(caCert.subject.attributes);
    clientCert.setSubject(clientCertReq.subject.attributes);
    clientCert.setExtensions([
      { name: "basicConstraints", cA: false },
      {
        name: "keyUsage",
        keyCertSign: false,
        digitalSignature: true,
        keyEncipherment: true,
      },
      { name: "extKeyUsage", serverAuth: false, clientAuth: true },
    ]);
    clientCert.sign(caKey);
    const clientCertPem = forge.pki.certificateToPem(clientCert);
    const clientKeyPem = forge.pki.privateKeyToPem(clientKey);

    return { clientCertPem, clientKeyPem };
  },
};

export default tlsService;
