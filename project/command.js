const program = require("commander");
require("./src/moduleAliasInit");

program.version("1.0.0").description("vidly Api Commands");

program
    .command("seed <model> <count>")
    .option("-n, --new")
    .action(require("@commands/seed"));

program.command("make:seeder <model>").action(require("@commands/makeSeeder"));

program.command("make:model <model>").action(require("@commands/makeModel"));

program
    .command("make:schema <name>")
    .option("-f, --force")
    .action(require("@commands/makeSchema"));

program
    .command("make:resource <name>")
    .action(require("@commands/makeResource"));

program
    .command("copy:env")
    .option("-f, --force")
    .action(require("@commands/copyEnv"));

program.command("make:secret").action(require("@commands/makeSecret"));

program
    .command("admin")
    .option("-f, --force")
    .action(require("@commands/admin"));

program.command("clear:db [model]").action(require("@commands/clearDb"));

program.parse(process.argv);
