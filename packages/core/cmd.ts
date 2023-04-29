#!/usr/bin/env node
import "dotenv/config";
import { Bean } from "./src/bean.js";
import { Command } from "commander";
import fs from "fs";
import path from "path";

const beanConfigPath = path.join(process.cwd(), "bean.config.json");

const beanConfigImport = await import(beanConfigPath, {
  assert: { type: "json" },
});

const beanConfig: BeanConfig = beanConfigImport.default;

const program = new Command();

const bean = new Bean(beanConfig);

program
  .command("dev")
  .description("Starts development server for the Bean site")
  .action(() => {
    bean.serve();
  });

program.parse();
