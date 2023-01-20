#! /usr/bin/env node
import { program } from 'commander'
import { readSettings } from './readSettings.mjs'
import { connect, remap, dot, raw } from './jira.mjs'
program
    .command('version')
    .description('Check the version of the application')
    .action(() => {
        console.log('Welcome. Running version 0.1.0')
    });

const jiraCommand = (name, description, action) => {
    return new program.Command(name)
        .description(description)
        .argument('[pathTo.yaml]', 'path to a YAML file')
        .option('-s, --server <type>', 'the server to connect to')
        .option('-u, --username <type>', 'your username - typically an email address')
        .option('-p, --password <type>', 'you api token as setup in your jira porfolio on https://id.atlassian.com/manage-profile/security/api-tokens ')
        .option('-q, --query <type>', 'A query to pass to Jira')
        .option('-n, --number <type>', 'Max number of issues to return', '50')
        .action(function(filePath, settings) {
            let allSettings = readSettings(filePath, settings)
            action(allSettings)
        })
}

program.addCommand(
    jiraCommand(
        'connect',
        'Connects to a remote instace using a url, username & password',
        connect
    )
);
program.addCommand(
    jiraCommand(
        'raw',
        'Shows the raw output of the query',
        raw
    )
);
program.addCommand(
    jiraCommand(
        'remap',
        `Remap Jira data based on the configuration
        Default configuration is to map as follows...
        '#0000ff' = ['Backlog', 'Ready For Shaping', 'Ready for Development']
        '#FFFF00' = ['Doing', 'Review', 'Testing']
        '#00FF00' = ['Build', 'Released']`,
        remap
    )
);
program.addCommand(
    jiraCommand(
        'dot',
        'Turn a Jira query into Dot Notation showing a dependency diagram',
        dot
    )
);

program.parse()