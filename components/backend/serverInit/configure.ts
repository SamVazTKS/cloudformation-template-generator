
export default (config : any) => ({
    commands: {
      "01_set_system_preferences": {
        command: `echo "vm.max_map_count=262144" | sudo tee -a /etc/sysctl.conf > /dev/null && echo "fs.file-max=65536" | sudo tee -a /etc/sysctl.conf > /dev/null && sudo sysctl -p`,
      },
      "02_allow_user_docker": {
        command: "sudo usermod -aG docker ubuntu",
      },
      "03_configure_firewall": {
        command: `sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw allow 8000
sudo ufw --force enable`,
      },
      "04_setup_srv_folder": {
        command: `sudo chown ubuntu:ubuntu -R /srv
sudo chmod u=rwX,g=srX,o=rX -R /srv`,
      },
      "05_install_codedeploy_agent": {
        command: `wget https://aws-codedeploy-us-east-2.s3.us-east-2.amazonaws.com/latest/install
chmod +x ./install
sudo ./install auto > /tmp/logfile`,
      },
      "06_add_env_variables": {
        command: {
          "Fn::Sub": [
            `echo "export AWS_REGION=${config.awsRegion}" >> /home/ubuntu/.bashrc
echo "export AWS_ACCOUNT_ID=${config.awsAccountId}" >> /home/ubuntu/.bashrc
echo "export IMAGE_REPO_NAME=${config.env}-${config.appName}-backend" >> /home/ubuntu/.bashrc`,
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
            `touch /home/ubuntu/.env
echo "export AWS_REGION=${config.awsRegion}" >> /home/ubuntu/.env
echo "export AWS_ACCOUNT_ID=${config.awsAccountId}" >> /home/ubuntu/.env
echo "export CODEDEPLOY_START_CMD=\\"${config.codedeployStartCmd}\\"" >> /home/ubuntu/.env
echo "export IMAGE_REPO_NAME=${config.env}-${config.appName}-backend" >> /home/ubuntu/.env`,
            {
              AwsRegion: { Ref: "AwsRegion" },
              AwsAccountId: { Ref: "AwsAccountId" },
              CodedeployStartCmd: { Ref: "CodedeployStartCmd" },
            },
          ],
        },
      },
      "08_update_packages": {
        command: `export DEBIAN_FRONTEND=noninteractive
export DEBIAN_PRIORITY=critical
sudo apt-get -y update && sudo apt-get -y -o "Dpkg::Options::=--force-confdef" -o "Dpkg::Options::=--force-confold" upgrade`,
      },
    },
  })