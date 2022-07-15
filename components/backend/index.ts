"use strict";

import fs from "fs";
import serverRole from "./roles/appServerRole";
import configure from "./serverInit/configure";
import install from "./serverInit/install";

const dotEnv = fs.readFileSync("./.env.server").toString();

export default (config : any) => ({
  /*
    Server setup
      EC2 instance for running the backend
  */

  appServerRole: serverRole,

  appServerInstanceProfile: {
    Type: "AWS::IAM::InstanceProfile",
    Properties: {
      Path: "/",
      Roles: [
        {
          Ref: "appServerRole",
        },
      ],
    },
  },

  appServerSecurityGroup: {
    Type: "AWS::EC2::SecurityGroup",
    Properties: {
      GroupDescription: "SSH Access",
      GroupName: `${config.env}-${config.appName}-serverSecurityGroup`,
      SecurityGroupIngress: [
        {
          IpProtocol: "tcp",
          FromPort: "22",
          ToPort: "22",
          CidrIp: { Ref: "ServerSSHAccessIp" },
        },
        {
          IpProtocol: "tcp",
          FromPort: "80",
          ToPort: "80",
          CidrIp: "0.0.0.0/0",
        },
        {
          IpProtocol: "tcp",
          FromPort: "443",
          ToPort: "443",
          CidrIp: "0.0.0.0/0",
        },
        {
          IpProtocol: "tcp",
          FromPort: "8000",
          ToPort: "8000",
          CidrIp: "0.0.0.0/0",
        },
      ],
      Tags: [
        {
          Key: "Name",
          Value: `${config.env}-${config.appName}-serverSecurityGroup`,
        },
        { Key: "Project", Value: config.appName },
        { Key: "Env", Value: config.env },
      ],
    },
  },

  server: {
    Type: "AWS::EC2::Instance",
    Metadata: {
      Comment1: "Prepare the system",

      "AWS::CloudFormation::Init": {
        configSets: {
          InstallAndConfigure: ["Install", "Configure"],
        },

        Install: install(dotEnv),
        Configure: configure(config),
      },
    },

    Properties: {
      //ImageId: "ami-00399ec92321828f5",
      ImageId: "ami-0960ab670c8bb45f3",//Ubuntu Server 20.04 LTS (HVM), SSD Volume Type us-east-2
      KeyName: { Ref: "ServerSSHKeyPair" },
      InstanceType: "t3a.small",
      IamInstanceProfile: { Ref: "appServerInstanceProfile" },
      SecurityGroupIds: [{ Ref: "appServerSecurityGroup" }],
      BlockDeviceMappings: [
        {
          DeviceName: "/dev/sda1",
          Ebs: { VolumeSize: "20" },
        },
      ],
      Tags: [
        { Key: "Name", Value: `${config.env}-${config.appName}-server` },
        { Key: "Project", Value: config.appName },
        { Key: "Env", Value: config.env },
      ],

      UserData: {
        "Fn::Base64": {
          "Fn::Join": [
            "",
            [
              "#!/bin/bash -xe\n",
              "apt-get update -y\n",
              "apt-get install -y python-setuptools\n",
              "mkdir -p /opt/aws/bin\n",
              "wget https://s3.amazonaws.com/cloudformation-examples/aws-cfn-bootstrap-latest.tar.gz\n",
              "python2 -m easy_install --script-dir /opt/aws/bin aws-cfn-bootstrap-latest.tar.gz\n",
              "/opt/aws/bin/cfn-init -v ",
              "         --stack ",
              { Ref: "AWS::StackName" },
              "         --resource server ",
              "         --configsets InstallAndConfigure ",
              "         --region ",
              { Ref: "AWS::Region" },
              " > /home/ubuntu/cfn-init.log ",
              "\n",
              
              "/opt/aws/bin/cfn-signal -e $? ",
              "         --stack ",
              { Ref: "AWS::StackName" },
              "         --resource server ",
              "         --region ",
              { Ref: "AWS::Region" },
              " > /home/ubuntu/cfn-signal.log ",
              "\n",
            ],
          ],
        },
      },
    },
  },
  jumpoxEIP: {
    Type: "AWS::EC2::EIP",
    Properties: {
      InstanceId: { Ref: "server" },
    },
  },
});