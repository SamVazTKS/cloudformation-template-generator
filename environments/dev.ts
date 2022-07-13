import * as fs from "fs";

export const config = {
  // Configurable on stack creation:
  //serverSSHAccessIp: "186.96.182.141/32",
  //Ip MUST BE a range
  serverSSHAccessIp: "0.0.0.0/0",
  serverSSHKeyPair: "hire app server key",
  awsRegion: "us-east-2",
  awsAccountId: "727499554548",
  gitHubOAuthToken: "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",
  gitSSHKey: fs.readFileSync("id_ksquare_gitHub").toString(),
  gitHubOwner: "SamVazTKS",
  gitHubRepoBackend: "ksHireDummyBackend",
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