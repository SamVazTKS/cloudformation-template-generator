import parameters from "./components/setup/parameters";
import storage from "./components/setup/storage";
import frontendCICD from "./components/frontend/cicd";
import frontendSetup from "./components/frontend/index";
import backendCICD from "./components/backend/cicd";
import backendSetup from "./components/backend/index";

const mernStack = async (config : any ) => ({
    AWSTemplateFormatVersion: "2010-09-09",
    Description: `Base Environment Configuration for basic MERN stack`,
    Parameters: await parameters(config),
    Resources: {
      ...storage(config),
    //   ...server(config),
      ...frontendSetup(config),
      ...frontendCICD(config),
      ...backendSetup(config),
      ...backendCICD(config),
    //   ...(config.useRdsDB ? db(config) : {}),
      // ...(config.backup ? backup(config) : {}),
    //   ...frontend(config),
    //   ...frontendCicd(config),
    },
    Outputs: {},
})

export default mernStack;