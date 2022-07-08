const buildRole = {
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
}
export default buildRole