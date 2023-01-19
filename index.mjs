#! /usr/bin/env node
import { program } from 'commander'
import chalk from 'chalk'
import { connect } from './jira.mjs'
program
    .command('version')
    .description('Check the version of the application')
    .action(() => {
        console.log(chalk.red.bold('Welcome. Running version 0.1.0'))
    });

program
    .command('connect')
    .description('Connects to a remote instace using a url, username & password')
    .option('-s, --server <type>', 'the server to connect to')
    .option('-u, --username <type>', 'your username - typically an email address')
    .option('-p, --password <type>', 'you api token as setup in your jira porfolio on https://id.atlassian.com/manage-profile/security/api-tokens ')
    .option('-q, --query <type>', 'A query to pass to Jira', 'updatedDate >= -14d')
    .action(connect);

program.parse()