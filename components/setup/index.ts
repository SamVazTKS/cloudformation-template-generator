export default (config: any) => ({
    appCodeBuildSourceCredential: {
        Type: "AWS::CodeBuild::SourceCredential",
        Properties: {
          AuthType: "PERSONAL_ACCESS_TOKEN",
          ServerType: "GITHUB",
          Token: { Ref: "GitHubOAuthToken" },
          Username: { Ref: "GitHubOwner" }
        }
      }
})