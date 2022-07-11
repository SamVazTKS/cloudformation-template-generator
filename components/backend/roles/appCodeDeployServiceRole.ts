const codeDeployServiceRole = {
    Type: "AWS::IAM::Role",
    Properties: {
      AssumeRolePolicyDocument: {
        Version: "2012-10-17",
        Statement: {
          Effect: "Allow",
          Principal: {
            Service: "codedeploy.amazonaws.com",
          },
          Action: "sts:AssumeRole",
        },
      },
      ManagedPolicyArns: [
        "arn:aws:iam::aws:policy/service-role/AWSCodeDeployRole",
      ],
    },
  }

  export default codeDeployServiceRole;