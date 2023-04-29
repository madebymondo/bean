#!/usr/bin/env node
import "dotenv/config";
import { Bean } from "./index.js";
import { compileAndRunTS } from "./utils/compleAndRunTs.js";
import { Command } from "commander";
import path from "path";

const program = new Command();

const beanConfigPath = path.join(process.cwd(), "bean.config.ts");
const beanConfig = await compileAndRunTS(beanConfigPath);
const bean = new Bean(beanConfig[0]);

program
  .command("dev")
  .description("Starts development server for the Bean site")
  .action(() => {
    bean.serve();
  });

program.parse();
