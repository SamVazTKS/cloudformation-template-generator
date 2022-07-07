import * as fs from "fs";

export const config = {
  // Configurable on stack creation:
  //serverSSHAccessIp: "186.96.182.141/32",
  //serverSSHKeyPair: "kportal-dev",
  awsRegion: "us-east-2",
  awsAccountId: "727499554548",
  gitHubOAuthToken: "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",
  //gitSSHKey: fs.readFileSync("./../id_rsa").toString(),
  gitHubOwner: "SamVazTKS",
  //gitHubRepoBackend: "kportal-back",
  gitHubRepoFrontend: "ksHireDummyClient",
  backendBranch: "develop",
  frontendBranch: "develop",
  //apiUrl: "dev-portalapi.theksquaregroup.com",
  //appUrl: "devportal.theksquaregroup.com",
  // Non configurable on stack creation:
  appName: "hire",
  env: "dev",
  backup: false,
  dbDeletionPolicy: "Delete",
  s3DeletionPolicy: "Delete",
  useRdsDB: false,
  codedeployStartCmd: "npm run docker:dev",
};