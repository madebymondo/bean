#!/usr/bin/env node
import "dotenv/config";
import { Bean } from "./index.js";
import { compileAndRunTS } from "./utils/compileAndRunTs.js";
import { Command } from "commander";
import path from "path";
import { exec } from "child_process";
import chalk from "chalk";

const program = new Command();

const beanConfigPath = path.join(process.cwd(), "bean.config.ts");
const beanConfigFunctions = await compileAndRunTS(beanConfigPath);
const beanConfig = beanConfigFunctions.find((func) => func.key === "default");
const { renderMode, b } = beanConfig.callback();

const bean = new Bean(beanConfig.callback());

program
  .command("dev")
  .description("Starts development server for the Bean site")
  .action(async () => {
    await bean.serve();
  });

program
  .command("build")
  .description("Builds output for the Bean site")
  .action(async () => {
    await bean.build(renderMode || "ssg");
  });

program
  .command("start")
  .description("Starts server app")
  .action(() => {
    console.log(`Starting server...`);
    const serverProcess = exec(
      `node ${path.join(process.cwd(), "dist", "server.js")}`
    );

    serverProcess.stdout.on("data", (data) => {
      console.log(chalk.blue(`[Server Process]: ${data.toString()}`));
    });

    serverProcess.stderr.on("data", (data) => {
      console.error(chalk.red(`[Server Error]: ${data.toString()}`));
    });

    serverProcess.on("exit", (code) => {
      console.log(chalk.blue(`[Server Exit]: ${code.toString()}`));
    });
  });

program.parse();
