import parameters from "./components/setup/parameters";
import storage from "./components/setup/storage";
import general from "./components/setup/index";
import FrontendAPP  from "./components/frontend/index";
import FrontendCICD  from "./components/frontend/cicd";
import BackendCICD from "./components/backend/cicd";
import BackendAPP from "./components/backend/index";


const mernStack = async (config : any ) => ({
  AWSTemplateFormatVersion: "2010-09-09",
  Description: `Base Environment Configuration for basic MERN stack`,
  Parameters: await parameters(config),
  Resources: {
    ...general(config),
    ...storage(config),
  //   ...server(config),
  //  ...FrontendAPP(config),
  //  ...FrontendCICD(config),
    ...BackendAPP(config),
    ...BackendCICD(config),
  //   ...(config.useRdsDB ? db(config) : {}),
    // ...(config.backup ? backup(config) : {}),
  //   ...frontend(config),
  //   ...frontendCicd(config),
  },
  Outputs: {},
})

export default mernStack;