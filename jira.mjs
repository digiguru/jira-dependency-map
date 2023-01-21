
import JiraApi from 'jira-client';
import {remapTickets} from './remapper.mjs'
import { parseMultipleBlockers } from "./parse.mjs";
import {toDot} from './toDot.mjs';

export async function connect (args) {
    const data = await queryJira(args);
    const issues = data.issues;
    console.log(`Query returns ${issues.length}`);
}
export async function raw (args) {
  const data = await queryJira(args);
  const issues = data.issues;
  console.log(JSON.stringify(issues, null, 2));
}

export async function remap (args) {
  const tickets = await parseJira(args);
  console.log(tickets);
}
export async function dot (args) {
  const tickets = await parseJira(args);
  const dot = toDot(tickets);
  console.log(dot)
}
function connectJira({server, username, password}) {
  return new JiraApi({
    protocol: 'https',
    host: server,
    username: username,
    password: password,
    apiVersion: '3',
    strictSSL: true
  });
}

async function queryJira({server, username, password, query, number}) {
  const jira = connectJira({server, username, password, query});
  const data = await jira.searchJira(query, {maxResults: number});
  return data;
}

async function parseJira ({server, username, password, query, number, map}) {
  const data = await queryJira({server, username, password, query, number});
  let settings = {};

  for (const property in map) {
    settings[property] = {
      value: map[property].value || map[property],
      default: map[property]?.default || null,
      remap: map[property]?.remap
    };
  }
  let parsedTickets =  parseMultipleBlockers(data.issues, settings);
  
  Object.keys(settings).forEach((key,i) => {
    if(Array.isArray(settings[key].remap)) {
      parsedTickets  = remapTickets(settings[key].remap, parsedTickets, key)
    }
  })
  return parsedTickets;
}

/*
curl -D- \
   -u fred@example.com:freds_api_token \
   -X GET \
   -H "Content-Type: application/json" \
   https://your-domain.atlassian.net/rest/api/2/issue/createmeta
   */