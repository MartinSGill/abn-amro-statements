#!/usr/bin/env node

import * as chalk from "chalk";
import winston = require("winston");

import { Reader } from "./mt940/Reader";
import { Writer } from "./qif/Writer";

declare interface AbnAmroStatementsOptions {
  input: string;
}

function AbnAmroStatements(options: AbnAmroStatementsOptions) {

  if (!console.debug) {
    console.debug = function (text) {
      console.info(text);
    };
  }

  const fs = require("fs");
  const file = options.input;

  winston.info("Opening", file);
  const content = fs.readFileSync(file, {encoding: "utf8"});

  winston.log("debug", "Creating MT940 reader");
  const reader = new Reader(content);
  for (const account in reader.accounts) {
    winston.info("Writing account " + account + " to " + account + ".qif");
    const current = reader.accounts[account];
    const qif = Writer.write(current);
    fs.writeFileSync(account + ".qif", qif, {encoding: "utf8"});
  }
}

const argv = require("yargs")
  .usage(
    chalk.blue("Convert ")
    + chalk.magenta("Abn Amro")
    + chalk.blue(" MT940 statements to QIF.\n\n")
    + chalk.blue("USAGE: ") + "abn-amro-statements " + chalk.yellow("<file>")
  )
  .option("v", {
    alias: "verbose",
    type: "count",
    description: "more output, specify twice for very-verbose."
  })
  .showHelpOnFail(false, chalk.yellow("Specify --help for available options"))
  .help("help")
  .demand(1)
  .argv;

winston.cli();
switch (argv.verbose) {
  case 0:
    winston.level = "info";
    break;
  case 1:
    winston.level = "debug";
    break;
  case 2:
  default:
    winston.level = "verbose";
}

AbnAmroStatements({ input: argv._[0] });
