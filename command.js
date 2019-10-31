#!/usr/bin/env node

const program = require("commander");

program.version("1.0.0").description("API Base Project Builder");

program.command("new <name> [folderName]").action(require("./commands/new"));

program.parse(process.argv);
