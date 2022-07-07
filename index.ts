import * as fs from "fs";

import { config as configDev } from "./environments/dev";
import template from "./basicMERNstack";

/*
  Generates AWS CloudFormation templates in json format.
    Input: src/template.js
    Output: cloudformation-templates/template.json
*/

async function main() {
  fs.writeFileSync(
    `cloudformation-templates-output/template.dev.json`,
    JSON.stringify(await template(configDev), null, 2),
  );
  // fs.writeFileSync(
  //   `cloudformation-templates/template.qa.json`,
  //   JSON.stringify(await template(configQa), null, 2),
  // );
  // fs.writeFileSync(
  //   `cloudformation-templates/template.prod.json`,
  //   JSON.stringify(await template(configProd), null, 2),
  // );
}

main();
