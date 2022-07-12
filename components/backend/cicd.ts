import backendBuldRole from "./roles/appBackendBuildRole";
import codeDeployServiceRole from "./roles/appCodeDeployServiceRole";
import codePipelineServiceRole from "./roles/appCodePipelineServiceRole";

const cicd =(config : any ) => ({

  /*
    Roles
  */
  //CodeBuilder
  appBackendBuildRole: backendBuldRole,

  //CodeDeploy
  appCodeDeployServiceRole: codeDeployServiceRole,

  //CodePipeline
  appCodePipelineServiceRole: codePipelineServiceRole,

    /*
    CI/CD Setup
  */

  // ECR - Hosts the Docker images for the app
  appContainerRepository: {
    Type: "AWS::ECR::Repository",
    Properties: {
      RepositoryName: `${config.env}-${config.appName}-backend`,
      RepositoryPolicyText: {
        Version: "2008-10-17",
        Statement: [
          {
            Sid: "AllowPushPull",
            Effect: "Allow",
            Principal: {
              AWS: [
                { "Fn::GetAtt": ["appBackendBuildRole", "Arn"] },
                { "Fn::GetAtt": ["appServerRole", "Arn"] },
              ],
            },
            Action: [
              "ecr:GetDownloadUrlForLayer",
              "ecr:BatchGetImage",
              "ecr:BatchCheckLayerAvailability",
              "ecr:PutImage",
              "ecr:InitiateLayerUpload",
              "ecr:UploadLayerPart",
              "ecr:CompleteLayerUpload",
            ],
          },
        ],
      },
      Tags: [
        {
          Key: "Name",
          Value: `${config.env}-${config.appName}BackendContainerRepository`,
        },
        { Key: "Project", Value: config.appName },
        { Key: "Env", Value: config.env },
      ],
    },
  },

  // CodeBuild - Builds Docker images and uploads them to ECR

  appBackendCodeBuild: {
    Type: "AWS::CodeBuild::Project",
    Properties: {
      Name: `${config.env}-${config.appName}-backend`,
      Description: `Builds ${config.appName} Docker image`,
      ServiceRole: { "Fn::GetAtt": ["appBackendBuildRole", "Arn"] },
      Artifacts: {
        Type: "CODEPIPELINE",
      },
      Environment: {
        Type: "LINUX_CONTAINER",
        ComputeType: "BUILD_GENERAL1_SMALL",
        Image: "aws/codebuild/standard:4.0",
        PrivilegedMode: true,
        EnvironmentVariables: [
          {
            Name: "IMAGE_REPO_NAME",
            Type: "PLAINTEXT",
            Value: `${config.env}-${config.appName}-backend`,
          },
          {
            Name: "IMAGE_TAG",
            Type: "PLAINTEXT",
            Value: `dummy`,
          },
          {
            Name: "AWS_ACCOUNT_ID",
            Type: "PLAINTEXT",
            Value: { Ref: "AwsAccountId" },
          },
          {
            Name: "AWS_REGION",
            Type: "PLAINTEXT",
            Value: { Ref: "AwsRegion" },
          },
          {
            Name: "SSH_KEY",
            Type: "PLAINTEXT",
            Value: config.gitSSHKey,
          },
          {
            Name: "SERVER_ADDRESS",
            Type: "PLAINTEXT",
            Value: { "Fn::GetAtt": ["server", "PrivateIp"] },
          },
          {
            Name: "GIT_BRANCH",
            Type: "PLAINTEXT",
            Value: config.backendBranch,
          },
        ],
      },
      // Source: {
      //   Type: "CODEPIPELINE",
      // },
      // SourceVersion: { Ref: "GitHubBranchBackend" },
      // TimeoutInMinutes: 30,
      // LogsConfig: {
      //   CloudWatchLogs: {
      //     Status: "ENABLED",
      //   },
      // },
      Source: {
        Type: "GITHUB",
        Location: `https://github.com/${config.gitHubOwner}/${config.gitHubRepoBackend}`,
        BuildSpec: "buildspec.yaml",
        Auth: {
          Type: "OAUTH",
          Resource: { Ref: "appCodeBuildSourceCredential" }
        }
      },
      Triggers: {
        Webhook: true,
        FilterGroups: [[
          {
            Type: "EVENT",
            Pattern: "PULL_REQUEST_CREATED, PULL_REQUEST_UPDATED, PULL_REQUEST_REOPENED, PULL_REQUEST_MERGED"
          }, 
          { 
            Type: "BASE_REF", 
            Pattern: `^refs/heads/${config.frontendBranch}$`
          }
         ]
        ]
      },
      SourceVersion: { Ref: "GitHubBranchBackend" },
      TimeoutInMinutes: 30,
      LogsConfig: {
        CloudWatchLogs: {
          Status: "ENABLED",
        },
      },
      Tags: [
        {
          Key: "Name",
          Value: `${config.env}-${config.appName}BackendCodeBuild`,
        },
        { Key: "Project", Value: config.appName },
        { Key: "Env", Value: config.env },
      ],
    },
  },

  // CodeDeploy - Deploys the app into the server
  appCodeDeployApplicaton: {
    Type: "AWS::CodeDeploy::Application",
    Properties: {
      ApplicationName: `${config.env}-${config.appName}-backend`,
      ComputePlatform: "Server",
      Tags: [
        {
          Key: "Name",
          Value: `${config.env}-${config.appName}CodeDeployApplicaton`,
        },
        { Key: "Project", Value: config.appName },
        { Key: "Env", Value: config.env },
      ],
    },
  },

  appCodeDeployDeploymentGroup: {
    Type: "AWS::CodeDeploy::DeploymentGroup",
    Properties: {
      ApplicationName: { Ref: "appCodeDeployApplicaton" },
      DeploymentGroupName: `${config.env}-${config.appName}-backend-deployment-group`,
      Ec2TagFilters: [
        {
          Key: "Name",
          Type: "KEY_AND_VALUE",
          Value: `${config.env}-${config.appName}-server`,
        },
      ],
      ServiceRoleArn: { "Fn::GetAtt": ["appCodeDeployServiceRole", "Arn"] },
    },
  },

  // CodePipeline - Orchestrates CI/CD, when a merge is done to main branch, CodeBuild and then CodeDeploy are executed
  appCodePipelineArtifactStore: {
    Type: "AWS::S3::Bucket",
    Properties: {
      BucketName: `${config.env}-${config.appName}-codepipeline-artifactstore`,
      AccessControl: "Private",
      Tags: [
        {
          Key: "Name",
          Value: `${config.env}-${config.appName}CodePipelineArtifactStore`,
        },
        { Key: "Project", Value: config.appName },
        { Key: "Env", Value: config.env },
      ],
    },
  },

  appCodePipelineWebhook: {
    Type: "AWS::CodePipeline::Webhook",
    Properties: {
      Authentication: "GITHUB_HMAC",
      AuthenticationConfiguration: {
        SecretToken: { Ref: "GitHubOAuthToken" },
      },
      Filters: [
        {
          JsonPath: "$.ref",
          MatchEquals: "refs/heads/{Branch}",
        },
      ],
      TargetPipeline: {
        Ref: "appCodePipeline",
      },
      TargetAction: "SourceAction",
      Name: `${config.env}-${config.appName}CodePipelineWebhook`,
      TargetPipelineVersion: {
        "Fn::GetAtt": ["appCodePipeline", "Version"],
      },
      RegisterWithThirdParty: true,
    },
  },

  appCodePipeline: {
    Type: "AWS::CodePipeline::Pipeline",
    Properties: {
      RoleArn: { "Fn::GetAtt": ["appCodePipelineServiceRole", "Arn"] },
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
                Repo: { Ref: "GitHubRepoBackend" },
                Branch: { Ref: "GitHubBranchBackend" },
                OAuthToken: { Ref: "GitHubOAuthToken" },
                PollForSourceChanges: false,
              },
              RunOrder: 1,
            },
          ],
        },
        {
          Name: "Build",
          Actions: [
            {
              Name: "BuildAction",
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
                ProjectName: { Ref: "appBackendCodeBuild" },
              },
              RunOrder: 1,
            },
          ],
        },
        {
          Name: "Deploy",
          Actions: [
            {
              Name: "DeployAction",
              InputArtifacts: [
                {
                  Name: "SourceOutput",
                },
              ],
              ActionTypeId: {
                Category: "Deploy",
                Owner: "AWS",
                Version: "1",
                Provider: "CodeDeploy",
              },
              Configuration: {
                ApplicationName: { Ref: "appCodeDeployApplicaton" },
                DeploymentGroupName: { Ref: "appCodeDeployDeploymentGroup" },
              },
              RunOrder: 1,
            },
          ],
        },
      ],
      ArtifactStore: {
        Type: "S3",
        Location: { Ref: "appCodePipelineArtifactStore" },
      },
      Tags: [
        { Key: "Name", Value: `${config.env}-${config.appName}CodePipeline` },
        { Key: "Project", Value: config.appName },
        { Key: "Env", Value: config.env },
      ],
    },
  },
});

export default cicd;