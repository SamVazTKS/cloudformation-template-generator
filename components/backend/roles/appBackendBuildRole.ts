const backendBuldRole = {
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
      Policies: [
        {
          PolicyName: "root",
          PolicyDocument: {
            Version: "2012-10-17",
            Statement: [
              {
                Effect: "Allow",
                Action: "events:*",
                Resource: "*",
              },
              {
                Action: [
                  "ecr:BatchCheckLayerAvailability",
                  "ecr:CompleteLayerUpload",
                  "ecr:GetAuthorizationToken",
                  "ecr:InitiateLayerUpload",
                  "ecr:PutImage",
                  "ecr:UploadLayerPart",
                  "s3:GetObject",
                ],
                Resource: "*",
                Effect: "Allow",
              },
            ],
          },
        },
      ],
      ManagedPolicyArns: ["arn:aws:iam::aws:policy/CloudWatchLogsFullAccess"],
    },
  }

  export default backendBuldRole;