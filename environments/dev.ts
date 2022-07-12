import * as fs from "fs";

export const config = {
  // Configurable on stack creation:
  //serverSSHAccessIp: "186.96.182.141/32",
  //Ip MUST BE a range
  serverSSHAccessIp: "0.0.0.0/0",
  serverSSHKeyPair: "dummy backend cloudformation github",
  awsRegion: "us-east-2",
  awsAccountId: "727499554548",
  gitHubOAuthToken: "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",
  gitSSHKey: fs.readFileSync("id_ed25519").toString(),
  gitHubOwner: "ksqrafaelhernandez",
  gitHubRepoBackend: "KsHireDummyBackend",
  gitHubRepoFrontend: "ksHireDummyClient",
  backendBranch: "develop",
  frontendBranch: "develop",
  //apiUrl: "dev-portalapi.theksquaregroup.com",
  //appUrl: "devportal.theksquaregroup.com",
  // Non configurable on stack creation:
  appName: "kshire",
  env: "dev",
  backup: false,
  dbDeletionPolicy: "Delete",
  s3DeletionPolicy: "Delete",
  useRdsDB: false,
  codedeployStartCmd: "npm run docker:dev",
};