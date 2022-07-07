"use strict";

export default (config : any ) => ({
  /*
    CI/CD Setup
  */

  // CodeBuild - Builds the app, uploads it to S3 and resets the CloudFront cache
  appFrontendBuildRole: {
    Type: "AWS::IAM::Role",
    Properties: {
      AssumeRolePolicyDocument: {
        Version: "2012-10-17",
        Statement: {
          Effect: "Allow",
          Principal: {
            Service: "codebuild.amazonaws.com",
          },
          Action: "sts:AssumeRole",
        },
      },
      ManagedPolicyArns: [
        "arn:aws:iam::aws:policy/AmazonS3FullAccess",
        "arn:aws:iam::aws:policy/CloudWatchLogsFullAccess",
        "arn:aws:iam::aws:policy/CloudFrontFullAccess",
      ],
    },
  },

  appFrontendCodeBuild: {
    Type: "AWS::CodeBuild::Project",
    Properties: {
      Name: `${config.env}-${config.appName}-frontend`,
      Description: `Builds and deploys ${config.env}-${config.appName}-frontend project`,
      ServiceRole: { "Fn::GetAtt": ["appFrontendBuildRole", "Arn"] },
      Artifacts: {
        Type: "CODEPIPELINE",
      },
      Environment: {
        Type: "LINUX_CONTAINER",
        ComputeType: "BUILD_GENERAL1_SMALL",
        Image: "aws/codebuild/standard:4.0",
        EnvironmentVariables: [
          {
            Name: "CLOUDFRONT_DIST_ID",
            Type: "PLAINTEXT",
            Value: { Ref: "appFrontendDistribution" },
          },
          {
            Name: "S3_BUCKET_NAME",
            Type: "PLAINTEXT",
            Value: `${config.env}-${config.appName}-frontend-bucket`,
          },
          {
            Name: "REACT_APP_API_BASE_URL",
            Type: "PLAINTEXT",
            Value: {
              "Fn::Join": ["", ["https://", { Ref: "APIUrl" }, "/api/v1"]],
            },
          },
          {
            Name: "REACT_APP_BASE_URL",
            Type: "PLAINTEXT",
            Value: {
              "Fn::Join": ["", ["https://", { Ref: "APIUrl" }]],
            },
          },
        ],
      },
      Source: {
        Type: "CODEPIPELINE",
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
  appFrontendCodePipelineArtifactStore: {
    Type: "AWS::S3::Bucket",
    Properties: {
      BucketName: `${config.env}-${config.appName}-frontend-codepipeline-artifactstore`,
      AccessControl: "Private",
      Tags: [
        {
          Key: "Name",
          Value: `${config.env}-${config.appName}FrontendCodePipelineArtifactStore`,
        },
        { Key: "Project", Value: config.appName },
        { Key: "Env", Value: config.env },
      ],
    },
  },

  appFrontendCodePipelineServiceRole: {
    Type: "AWS::IAM::Role",
    Properties: {
      AssumeRolePolicyDocument: {
        Version: "2012-10-17",
        Statement: {
          Effect: "Allow",
          Principal: {
            Service: "codepipeline.amazonaws.com",
          },
          Action: "sts:AssumeRole",
        },
      },
      Policies: [
        {
          PolicyName: "root",
          PolicyDocument: {
            Version: "2012-10-17",
            Statement: [
              {
                Action: ["iam:PassRole"],
                Resource: "*",
                Effect: "Allow",
                Condition: {
                  StringEqualsIfExists: {
                    "iam:PassedToService": [
                      "cloudformation.amazonaws.com",
                      "elasticbeanstalk.amazonaws.com",
                      "ec2.amazonaws.com",
                      "ecs-tasks.amazonaws.com",
                    ],
                  },
                },
              },
              {
                Action: [
                  "codecommit:CancelUploadArchive",
                  "codecommit:GetBranch",
                  "codecommit:GetCommit",
                  "codecommit:GetRepository",
                  "codecommit:GetUploadArchiveStatus",
                  "codecommit:UploadArchive",
                ],
                Resource: "*",
                Effect: "Allow",
              },
              {
                Action: [
                  "codedeploy:CreateDeployment",
                  "codedeploy:GetApplication",
                  "codedeploy:GetApplicationRevision",
                  "codedeploy:GetDeployment",
                  "codedeploy:GetDeploymentConfig",
                  "codedeploy:RegisterApplicationRevision",
                ],
                Resource: "*",
                Effect: "Allow",
              },
              {
                Action: ["codestar-connections:UseConnection"],
                Resource: "*",
                Effect: "Allow",
              },
              {
                Action: [
                  "elasticbeanstalk:*",
                  "ec2:*",
                  "elasticloadbalancing:*",
                  "autoscaling:*",
                  "cloudwatch:*",
                  "s3:*",
                  "sns:*",
                  "cloudformation:*",
                  "rds:*",
                  "sqs:*",
                  "ecs:*",
                ],
                Resource: "*",
                Effect: "Allow",
              },
              {
                Action: ["lambda:InvokeFunction", "lambda:ListFunctions"],
                Resource: "*",
                Effect: "Allow",
              },
              {
                Action: [
                  "opsworks:CreateDeployment",
                  "opsworks:DescribeApps",
                  "opsworks:DescribeCommands",
                  "opsworks:DescribeDeployments",
                  "opsworks:DescribeInstances",
                  "opsworks:DescribeStacks",
                  "opsworks:UpdateApp",
                  "opsworks:UpdateStack",
                ],
                Resource: "*",
                Effect: "Allow",
              },
              {
                Action: [
                  "cloudformation:CreateStack",
                  "cloudformation:DeleteStack",
                  "cloudformation:DescribeStacks",
                  "cloudformation:UpdateStack",
                  "cloudformation:CreateChangeSet",
                  "cloudformation:DeleteChangeSet",
                  "cloudformation:DescribeChangeSet",
                  "cloudformation:ExecuteChangeSet",
                  "cloudformation:SetStackPolicy",
                  "cloudformation:ValidateTemplate",
                ],
                Resource: "*",
                Effect: "Allow",
              },
              {
                Action: [
                  "codebuild:BatchGetBuilds",
                  "codebuild:StartBuild",
                  "codebuild:BatchGetBuildBatches",
                  "codebuild:StartBuildBatch",
                ],
                Resource: "*",
                Effect: "Allow",
              },
              {
                Effect: "Allow",
                Action: [
                  "devicefarm:ListProjects",
                  "devicefarm:ListDevicePools",
                  "devicefarm:GetRun",
                  "devicefarm:GetUpload",
                  "devicefarm:CreateUpload",
                  "devicefarm:ScheduleRun",
                ],
                Resource: "*",
              },
              {
                Effect: "Allow",
                Action: [
                  "servicecatalog:ListProvisioningArtifacts",
                  "servicecatalog:CreateProvisioningArtifact",
                  "servicecatalog:DescribeProvisioningArtifact",
                  "servicecatalog:DeleteProvisioningArtifact",
                  "servicecatalog:UpdateProduct",
                ],
                Resource: "*",
              },
              {
                Effect: "Allow",
                Action: ["cloudformation:ValidateTemplate"],
                Resource: "*",
              },
              {
                Effect: "Allow",
                Action: ["ecr:DescribeImages"],
                Resource: "*",
              },
              {
                Effect: "Allow",
                Action: [
                  "states:DescribeExecution",
                  "states:DescribeStateMachine",
                  "states:StartExecution",
                ],
                Resource: "*",
              },
              {
                Effect: "Allow",
                Action: [
                  "appconfig:StartDeployment",
                  "appconfig:StopDeployment",
                  "appconfig:GetDeployment",
                ],
                Resource: "*",
              },
            ],
          },
        },
      ],
    },
  },

  appFrontendCodePipelineWebhook: {
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
        Ref: "appFrontendCodePipeline",
      },
      TargetAction: "SourceAction",
      Name: `${config.env}-${config.appName}FrontendCodePipelineWebhook`,
      TargetPipelineVersion: {
        "Fn::GetAtt": ["appFrontendCodePipeline", "Version"],
      },
      RegisterWithThirdParty: true,
    },
  },

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
        Location: { Ref: "appFrontendCodePipelineArtifactStore" },
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
