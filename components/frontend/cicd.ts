import buildRole from "./roles/appFrontendBuildRole";
import codePipeLineRole from "./roles/appFrontendCodePipelineServiceRole";

const cicd = (config: any) => ({
  /*
    CI/CD Setup
  */

  // CodeBuild - Builds the app, uploads it to S3 and resets the CloudFront cache
  appFrontendBuildRole: buildRole,
  appFrontendCodePipelineServiceRole: codePipeLineRole,

  appCodeBuildSourceCredential: {
    Type : "AWS::CodeBuild::SourceCredential",
    Properties : {
      AuthType : "PERSONAL_ACCESS_TOKEN",
      ServerType : "GITHUB",
      Token : { Ref: "GitHubOAuthToken" },
      Username : { Ref: "GitHubOwner" }
    }
  },

  appFrontendCodeBuild: {
    Type: "AWS::CodeBuild::Project",
    Properties: {
      Name: `${config.env}-${config.appName}-frontend`,
      Description: `Builds and deploys ${config.env}-${config.appName}-frontend project`,
      ServiceRole: { "Fn::GetAtt": ["appFrontendBuildRole", "Arn"] },
      Artifacts: {
        Type: "NO_ARTIFACTS",
      },
      Environment: {
        Type: "LINUX_CONTAINER",
        ComputeType: "BUILD_GENERAL1_SMALL",
        Image: "aws/codebuild/standard:4.0",
        // EnvironmentVariables: [
        //   {
        //      Name: "CLOUDFRONT_DIST_ID",
        //      Type: "PLAINTEXT",
        //      Value: { Ref: "appFrontendDistribution" },
        //   },
        //   {
        //     Name: "S3_BUCKET_NAME",
        //     Type: "PLAINTEXT",
        //     Value: `${config.env}-${config.appName}-frontend-bucket`,
        //   },
        //   {
        //     Name: "REACT_APP_API_BASE_URL",
        //     Type: "PLAINTEXT",
        //     Value: {
        //       "Fn::Join": ["", ["https://", { Ref: "APIUrl" }, "/api/v1"]],
        //     },
        //   },
        //   {
        //     Name: "REACT_APP_BASE_URL",
        //     Type: "PLAINTEXT",
        //     Value: {
        //       "Fn::Join": ["", ["https://", { Ref: "APIUrl" }]],
        //     },
        //   },
        // ],
      },
      Source: {
        Type: "GITHUB",
        Location: "https://github.com/SamVazTKS/ksHireDummyClient",
        BuildSpec: "buildspec.yaml",
        Auth: {
          Type: "OAUTH",
          Resource: { Ref: "appCodeBuildSourceCredential" }
        }
      },
      Triggers: {
        Webhook: true,
        FilterGroups: [[{
          Type: "EVENT",
          Pattern: "PULL_REQUEST_CREATED, PULL_REQUEST_UPDATED"
        }]]
      },
      SourceVersion: { Ref: "GitHubBranchFrontend" },
      TimeoutInMinutes: 30,
      LogsConfig: {
        CloudWatchLogs: {
          Status: "ENABLED",
        },
      },
      Tags: [
        {
          Key: "Name",
          Value: `${config.env}-${config.appName}FrontendCodeBuild`,
        },
        { Key: "Project", Value: config.appName },
        { Key: "Env", Value: config.env },
      ],
    },
  },

  // CodePipeline - Orchestrates CI/CD, when a merge is done to main branch, CodeBuild is executed
  // appFrontendCodePipelineArtifactStore: {
  //   Type: "AWS::S3::Bucket",
  //   Properties: {
  //     BucketName: `${config.env}-${config.appName}-frontend-codepipeline-artifactstore`,
  //     AccessControl: "Private",
  //     Tags: [
  //       {
  //         Key: "Name",
  //         Value: `${config.env}-${config.appName}FrontendCodePipelineArtifactStore`,
  //       },
  //       { Key: "Project", Value: config.appName },
  //       { Key: "Env", Value: config.env },
  //     ],
  //   },
  // },



  // appFrontendCodePipelineWebhook: {
  //   Type: "AWS::CodePipeline::Webhook",
  //   Properties: {
  //     Authentication: "GITHUB_HMAC",
  //     AuthenticationConfiguration: {
  //       SecretToken: '{{resolve:secretmanager:GITHUB_ACCESS:SecretString:gitHubOAuthToken}}',
  //     },
  //     Filters: [
  //       {
  //         JsonPath: "$.ref",
  //         MatchEquals: "refs/heads/{Branch}",
  //       },
  //     ],
  //     TargetPipeline: {
  //       Ref: "appFrontendCodePipeline",
  //     },
  //     TargetAction: "SourceAction",
  //     Name: `${config.env}-${config.appName}FrontendCodePipelineWebhook`,
  //     TargetPipelineVersion: {
  //       "Fn::GetAtt": ["appFrontendCodePipeline", "Version"],
  //     },
  //     RegisterWithThirdParty: true,
  //   },
  // },

  appFrontendCodePipeline: {
    Type: "AWS::CodePipeline::Pipeline",
    Properties: {
      RoleArn: { "Fn::GetAtt": ["appFrontendCodePipelineServiceRole", "Arn"] },
      Stages: [
        {
          Name: "Source",
          Actions: [
            {
              Name: "SourceAction",
              ActionTypeId: {
                Category: "Source",
                Owner: "ThirdParty",
                Version: "1",
                Provider: "GitHub",
              },
              OutputArtifacts: [{ Name: "SourceOutput" }],
              Configuration: {
                Owner: { Ref: "GitHubOwner" },
                Repo: { Ref: "GitHubRepoFrontend" },
                Branch: { Ref: "GitHubBranchFrontend" },
                OAuthToken: { Ref: "GitHubOAuthToken" },
                PollForSourceChanges: false,
              },
              RunOrder: 1,
            },
          ],
        },
        {
          Name: "BuildAndDeploy",
          Actions: [
            {
              Name: "BuildAndDeployAction",
              InputArtifacts: [
                {
                  Name: "SourceOutput",
                },
              ],
              ActionTypeId: {
                Category: "Build",
                Owner: "AWS",
                Version: "1",
                Provider: "CodeBuild",
              },
              Configuration: {
                ProjectName: { Ref: "appFrontendCodeBuild" },
              },
              RunOrder: 1,
            },
          ],
        },
      ],
      ArtifactStore: {
        Type: "S3",
        Location: { Ref: "appFrontendBucket" },
      },
      Tags: [
        {
          Key: "Name",
          Value: `${config.env}-${config.appName}FrontendCodePipeline`,
        },
        { Key: "Project", Value: config.appName },
        { Key: "Env", Value: config.env },
      ],
    },
  },
});

export default cicd;