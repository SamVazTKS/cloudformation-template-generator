export default (dotEnv : any) => ({
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
  })
