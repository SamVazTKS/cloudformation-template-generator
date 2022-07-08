import * as fs from "fs";

import { config as configDev } from "./environments/dev";
import { config as configQa } from "./environments/qa";
import { config as configProd } from "./environments/prod";
import template from "./basicMERNstack";

/*
  Generates AWS CloudFormation templates in json format.
    Input: basicMERNstack.ts
    Output: cloudformation-templates/template.json
*/

async function main() {
  fs.writeFileSync(
    `cloudformation-templates-output/template.dev.json`,
    JSON.stringify(await template(configDev), null, 2),
  );
  fs.writeFileSync(
    `cloudformation-templates-output/template.qa.json`,
    JSON.stringify(await template(configQa), null, 2),
  );
  fs.writeFileSync(
    `cloudformation-templates-output/template.prod.json`,
    JSON.stringify(await template(configProd), null, 2),
  );
}

main();
