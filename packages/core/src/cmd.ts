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
export const beanConfigData = beanConfig.callback();
export const { renderMode, buildOutputPath } = beanConfigData;

const bean = new Bean(beanConfig.callback());

program
  .command("dev")
  .description("Starts development server for the Bean site")
  .action(async () => {
    console.log(`Starting development server...`);

    /* Run the development server file */
    const devSeverPath = `${path.join(
      process.cwd(),
      "/node_modules/@bean/core/dist/app.js"
    )}`;

    const serverProcess = exec(`node ${devSeverPath}`);

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
      `node --preserve-symlinks ${path.join(
        process.cwd(),
        buildOutputPath ? buildOutputPath : "dist",
        "server.js"
      )}`
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
