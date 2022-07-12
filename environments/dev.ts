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