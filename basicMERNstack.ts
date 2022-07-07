import parameters from "./components/setup/parameters";
import storage from "./components/setup/storage";
import cicd  from "./components/frontend/cicd";

const mernStack = async (config : any ) => ({
    AWSTemplateFormatVersion: "2010-09-09",
    Description: `Base Environment Configuration for basic MERN stack`,
    Parameters: await parameters(config),
    Resources: {
      ...storage(config),
    //   ...server(config),
       ...cicd(config),
    //   ...(config.useRdsDB ? db(config) : {}),
      // ...(config.backup ? backup(config) : {}),
    //   ...frontend(config),
    //   ...frontendCicd(config),
    },
    Outputs: {},
})

export default mernStack;