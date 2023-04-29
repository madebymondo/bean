#!/usr/bin/env node
import "dotenv/config";
import { Bean } from "./index.js";
import { compileAndRunTS } from "./utils/compileAndRunTs.js";
import { Command } from "commander";
import path from "path";

const program = new Command();

const beanConfigPath = path.join(process.cwd(), "bean.config.ts");
const beanConfigFunctions = await compileAndRunTS(beanConfigPath);
const beanConfig = beanConfigFunctions.find((func) => func.key === "default");

const bean = new Bean(beanConfig.callback());

program
  .command("dev")
  .description("Starts development server for the Bean site")
  .action(async () => {
    await bean.serve();
  });

program.parse();
