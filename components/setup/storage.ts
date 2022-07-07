const s3BucketResource = (config : any) => ({
  // Used for storing general files
  appFilesBucket: {
    Type: "AWS::S3::Bucket",
    Properties: {
      AccessControl: "Public",
      BucketName: `${config.env}-${config.appName}-deploy-bucket`,
      CorsConfiguration: {
        CorsRules: [
          {
            AllowedHeaders: ["*"],
            AllowedMethods: ["PUT", "GET"],
            AllowedOrigins: ["*"],
            ExposedHeaders: [],
            MaxAge: 3000,
          },
        ],
      },
      Tags: [
        {
          Key: "Name",
          Value: `${config.env}-${config.appName}-deploy-bucket`,
        },
        { Key: "Project", Value: config.appName },
        { Key: "Env", Value: config.env },
      ],
    },
    DeletionPolicy: config.s3DeletionPolicy,
  },
});

export default s3BucketResource;
