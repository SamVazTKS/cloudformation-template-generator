export default (config: any) => ({
  /*
    Frontend setup
      S3 bucket and CloudFront
  */

  appFrontendBucket: {
    Type: "AWS::S3::Bucket",
    Properties: {
      WebsiteConfiguration: {
        IndexDocument: "index.html"
      },
      BucketName: `${config.env}-${config.appName}-frontend-bucket`,
      Tags: [
        { Key: "Name", Value: `${config.env}-appFrontendBucket` },
        { Key: "Project", Value: config.appName },
        { Key: "Env", Value: config.env },
      ],
    },
    DeletionPolicy: "Delete",
  },
  appFrontendOriginAccessIdentity: {
    Type: "AWS::CloudFront::CloudFrontOriginAccessIdentity",
    Properties: {
      CloudFrontOriginAccessIdentityConfig: {
        Comment: "Allows CloudFront to access Private S3",
      },
    },
  },
  appFrontendBucketPolicy: {
    Type: "AWS::S3::BucketPolicy",
    Properties: {
      Bucket: `${config.env}-${config.appName}-frontend-bucket`,
      PolicyDocument: {
        Version: "2012-10-17",
        Statement: [
          {
            Effect: "Allow",
            Principal: {
              AWS: {
                "Fn::Sub": [
                  "arn:aws:iam::cloudfront:user/CloudFront Origin Access Identity ${appFrontendOriginAccessIdentity}",
                  {
                    appFrontendOriginAccessIdentity: {
                      Ref: "appFrontendOriginAccessIdentity",
                    },
                  },
                ],
              },
            },
            Action: "s3:GetObject",
            Resource: `arn:aws:s3:::${config.env}-${config.appName}-frontend-bucket/*`,
          },
        ],
      },
    },
  },
  appFrontendDistribution: {
    Type: "AWS::CloudFront::Distribution",
    Properties: {
      DistributionConfig: {
        Comment: "CDN for SPA",
        Aliases: [],
        Enabled: true,
        DefaultCacheBehavior: {
          Compress: true,
          ForwardedValues: {
            QueryString: true,
          },
          TargetOriginId: "only-origin",
          ViewerProtocolPolicy: "redirect-to-https",
        },
        DefaultRootObject: "index.html",
        CustomErrorResponses: [
          {
            ErrorCode: 404,
            ResponseCode: 200,
            ResponsePagePath: "/index.html",
          },
          {
            ErrorCode: 403,
            ResponseCode: 200,
            ResponsePagePath: "/index.html",
          },
        ],
        Origins: [
          {
            S3OriginConfig: {
              OriginAccessIdentity: {
                "Fn::Sub": [
                  "origin-access-identity/cloudfront/${appFrontendOriginAccessIdentity}",
                  {
                    appFrontendOriginAccessIdentity: {
                      Ref: "appFrontendOriginAccessIdentity",
                    },
                  },
                ],
              },
            },
            DomainName: { "Fn::GetAtt": ["appFrontendBucket", "DomainName"] },
            Id: "only-origin",
          },
        ],
        PriceClass: "PriceClass_100",
      },
      Tags: [
        { Key: "Name", Value: `${config.env}-appFrontendDistribution` },
        { Key: "Project", Value: config.appName },
        { Key: "Env", Value: config.env },
      ],
    },
  },
});
