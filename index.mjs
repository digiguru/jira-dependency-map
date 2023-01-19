#! /usr/bin/env node
import { program } from 'commander'
import chalk from 'chalk'

program
    .command('version')
    .description('Check the version of the application')
    .action(() => {
        console.log(chalk.red.bold('Welcome. Running version 0.1.0'))
    });

program.parse()