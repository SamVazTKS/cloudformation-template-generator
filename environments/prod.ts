import * as fs from "fs";

export const config = {
  // Configurable on stack creation:
  //serverSSHAccessIp: "186.96.182.141/32",
  //serverSSHKeyPair: "kportal-dev",
  awsRegion: "us-east-2",
  //awsAccountId: "709269308530",
  //gitHubOAuthToken: "",
  //gitSSHKey: fs.readFileSync("./../id_rsa").toString(),
  gitHubOwner: "Ksquare-University",
  //gitHubRepoBackend: "kportal-back",
  //gitHubRepoFrontend: "kportal-front",
  backendBranch: "master",
  frontendBranch: "master",
  //apiUrl: "dev-portalapi.theksquaregroup.com",
  //appUrl: "devportal.theksquaregroup.com",
  // Non configurable on stack creation:
  appName: "hire",
  env: "prod",
  backup: false,
  dbDeletionPolicy: "Delete",
  s3DeletionPolicy: "Delete",
  useRdsDB: false,
  codedeployStartCmd: "npm run docker:prod",
};