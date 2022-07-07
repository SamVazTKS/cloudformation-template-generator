"use strict";
// const { generateSecret } = require("../util");

const cloudformationParameters = async (config : any) => ({
  ServerSSHAccessIp: {
    Type: "String",
    Default: config.serverSSHAccessIp,
    Description: "Your ip so you can access the server via SSH",
  },
  ServerSSHKeyPair: {
    Type: "String",
    Default: config.serverSSHKeyPair,
    Description: "Your key pair so you can access the server via SSH",
  },
  AwsRegion: {
    Type: "String",
    Default: config.awsRegion,
    Description: "AWS Region to use",
  },
  AwsAccountId: {
    Type: "String",
    Default: config.awsAccountId,
    Description: "AWS Account Id where this environment is being deployed",
  },
  GitHubOAuthToken: {
    Type: "String",
    Default: config.gitHubOAuthToken,
    NoEcho: true,
    Description:
      "A GitHub Personal Access token of an account that has access to the backend and frontend repos",
  },
  GitHubOwner: {
    Type: "String",
    Default: config.gitHubOwner,
    AllowedPattern: "[A-Za-z0-9-]+",
    Description: "The name of the account that owns the repositories",
  },
  GitHubRepoBackend: {
    Type: "String",
    Default: config.gitHubRepoBackend,
    AllowedPattern: "[A-Za-z0-9-]+",
    Description:
      "The name of the backend repository (only name, not the whole url)",
  },
  GitHubBranchBackend: {
    Type: "String",
    Default: config.backendBranch,
    AllowedPattern: "[A-Za-z0-9-/]+",
    Description: "The branch that we will be using to build this environment",
  },
  GitHubRepoFrontend: {
    Type: "String",
    Default: config.gitHubRepoFrontend,
    AllowedPattern: "[A-Za-z0-9-]+",
    Description:
      "The name of the frontend repository (only name, not the whole url)",
  },
  GitHubBranchFrontend: {
    Type: "String",
    Default: config.frontendBranch,
    AllowedPattern: "[A-Za-z0-9-/]+",
    Description: "The branch that we will be using to build this environment",
  },
  APIUrl: {
    Type: "String",
    Default: config.apiUrl,
    Description:
      "The URL your frontend will use to communicate with your backend",
  },
  CodedeployStartCmd: {
    Type: "String",
    Default: config.codedeployStartCmd,
    Description:
      "The command used by codedeploy when starting the app in the server",
  },
  ...(config.useRdsDB
    ? {
        DBName: {
          Type: "String",
          Default: "appbackend",
          Description: "Name of the DB in PosrgreSQL RDS",
        },
        DBUser: {
          Type: "String",
          Default: "appuser",
          Description: "PostgreSQL Username",
        },
        // DBPassword: {
        //   Type: "String",
        //   Default: await generateSecret(),
        //   Description: "PostgreSQL Password",
        // },
      }
    : {}),
});

export default cloudformationParameters;