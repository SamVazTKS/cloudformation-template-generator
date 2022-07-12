const serverRole = {
    Type: "AWS::IAM::Role",
    Properties: {
      AssumeRolePolicyDocument: {
        Version: "2012-10-17",
        Statement: {
          Effect: "Allow",
          Principal: {
            Service: "ec2.amazonaws.com",
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
                Action: [
                  "ecr:BatchCheckLayerAvailability",
                  "ecr:CompleteLayerUpload",
                  "ecr:GetAuthorizationToken",
                  "ecr:InitiateLayerUpload",
                  "ecr:PutImage",
                  "ecr:UploadLayerPart",
                  "s3:Get*",
                  "s3:List*",
                ],
                Resource: "*",
                Effect: "Allow",
              },
            ],
          },
        },
      ],
      ManagedPolicyArns: [
        "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore",
      ],
    },
  }

  export default serverRole;