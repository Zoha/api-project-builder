const program = require("commander");
require("./src/moduleAliasInit");

program.version("1.0.0").description("$NAME$ Api Commands");

program
    .command("seed <model> <count>")
    .option("-n, --new")
    .action(require("@commands/seed"));

program.command("make:seeder <model>").action(require("@commands/makeSeeder"));

program.command("make:model <model>").action(require("@commands/makeModel"));

program
    .command("make:admin")
    .option("-u, --username <value>")
    .option("-p, --password <value>")
    .option("-e, --email <value>")
    .option("-n, --name <value>")
    .option("-r, --role <value>")
    .action(require("@commands/makeAdmin"));

program.command("clear:db [model]").action(require("@commands/clearDb"));

program.parse(process.argv);
