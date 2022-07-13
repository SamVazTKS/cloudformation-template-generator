"use strict";

import fs from "fs";
import serverRole from "./roles/appServerRole";

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

        Install: {
          packages: {
            apt: {
              "docker.io": [],
              "docker-compose": [],
              npm: [],
              ufw: [],
              git: [],
              "ruby-full": [],
              wget: [],
              awscli: [],
            },
          },

          files: {
            "/srv/.env": {
              content: dotEnv,
              mode: "000664",
              owner: "ubuntu",
              group: "ubuntu",
            },
          },
        },
        Configure: {
          commands: {
            "01_set_system_preferences": {
              command: `
echo "vm.max_map_count=262144" | sudo tee -a /etc/sysctl.conf > /dev/null && 
echo "fs.file-max=65536" | sudo tee -a /etc/sysctl.conf > /dev/null &&
sudo sysctl -p`,
            },
            "02_allow_user_docker": {
              command: "sudo usermod -aG docker ubuntu",
            },
            "03_configure_firewall": {
              command: `
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw --force enable`,
            },
            "04_setup_srv_folder": {
              command: `
sudo chown ubuntu:ubuntu -R /srv
sudo chmod u=rwX,g=srX,o=rX -R /srv`,
            },
            "05_install_codedeploy_agent": {
              command: `
wget https://aws-codedeploy-us-east-2.s3.us-east-2.amazonaws.com/latest/install
chmod +x ./install
sudo ./install auto > /tmp/logfile
`,
            },
            "06_add_env_variables": {
              command: {
                "Fn::Sub": [
                  `
echo "export AWS_REGION=\${AwsRegion}" >> /home/ubuntu/.bashrc
echo "export AWS_ACCOUNT_ID=\${AwsAccountId}" >> /home/ubuntu/.bashrc
echo "export IMAGE_REPO_NAME=${config.env}-${config.appName}-backend" >> /home/ubuntu/.bashrc
              `,
                  {
                    AwsRegion: { Ref: "AwsRegion" },
                    AwsAccountId: { Ref: "AwsAccountId" },
                  },
                ],
              },
            },
            "07_add_env_variables_for_codebuild": {
              command: {
                "Fn::Sub": [
                  `
touch /home/ubuntu/.env
echo "export AWS_REGION=\${AwsRegion}" >> /home/ubuntu/.env
echo "export AWS_ACCOUNT_ID=\${AwsAccountId}" >> /home/ubuntu/.env
echo "export CODEDEPLOY_START_CMD=\\"\${CodedeployStartCmd}\\"" >> /home/ubuntu/.env
echo "export IMAGE_REPO_NAME=${config.env}-${config.appName}-backend" >> /home/ubuntu/.env
              `,
                  {
                    AwsRegion: { Ref: "AwsRegion" },
                    AwsAccountId: { Ref: "AwsAccountId" },
                    CodedeployStartCmd: { Ref: "CodedeployStartCmd" },
                  },
                ],
              },
            },
            "08_update_packages": {
              command: `
export DEBIAN_FRONTEND=noninteractive
export DEBIAN_PRIORITY=critical
apt-get -y update && apt-get -y -o "Dpkg::Options::=--force-confdef" -o "Dpkg::Options::=--force-confold" upgrade`,
            },
          },
        },
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
              "\n",

              "/opt/aws/bin/cfn-signal -e $? ",
              "         --stack ",
              { Ref: "AWS::StackName" },
              "         --resource server ",
              "         --region ",
              { Ref: "AWS::Region" },
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