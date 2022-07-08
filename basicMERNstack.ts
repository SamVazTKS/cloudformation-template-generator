import parameters from "./components/setup/parameters";
import FrontendAPP  from "./components/frontend/index";
import FrontendCICD  from "./components/frontend/cicd";

const mernStack = async (config : any ) => ({
    AWSTemplateFormatVersion: "2010-09-09",
    Description: `Base Environment Configuration for basic MERN stack`,
    Parameters: await parameters(config),
    Resources: {
    //  ...storage(config),
    //   ...server(config),
       ...FrontendAPP(config),
       ...FrontendCICD(config),
    //   ...(config.useRdsDB ? db(config) : {}),
      // ...(config.backup ? backup(config) : {}),
    //   ...frontend(config),
    //   ...frontendCicd(config),
    },
    Outputs: {},
})

export default mernStack;