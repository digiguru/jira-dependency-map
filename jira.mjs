
import JiraApi from 'jira-client';
import {remapTickets} from './statusMapper.mjs'
import { parseMultipleBlockers } from "./parse.mjs";
import {toDot} from './toDot.mjs';

export async function connect ({server, username, password, query, number}) {
    const data = await queryJira({server, username, password, query, number});
    const issues = data.issues;
    console.log(`Query returns ${issues.length}`);
}

export async function remap ({server, username, password, query, number}) {
  const tickets = await parseJira({server, username, password, query, number});
  console.log(tickets);
}
export async function dot ({server, username, password, query, number}) {
  const tickets = await parseJira({server, username, password, query, number});
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
function columnMappings() {
  return [
    {'input': ['Backlog', 'Ready For Shaping', 'Ready for Development'], 
        'output': {'colour': '#0000ff'}},
    {'input': ['Doing', 'Review', 'Testing'], 
        'output': {'colour': '#FFFF00'}},
    {'input': ['Build', 'Released'], 
        'output': {'colour': '#00FF00'}}
  ];
}
async function queryJira({server, username, password, query, number}) {
  const jira = connectJira({server, username, password, query});
  const data = await jira.searchJira(query, {maxResults: number});
  return data;
}
async function parseJira ({server, username, password, query, number}) {
  const map = columnMappings();
  const data = await queryJira({server, username, password, query, number});

  const parsedTickets =  parseMultipleBlockers(data.issues);
 
  const tickets = remapTickets(map, parsedTickets);
  return tickets;
}

/*
curl -D- \
   -u fred@example.com:freds_api_token \
   -X GET \
   -H "Content-Type: application/json" \
   https://your-domain.atlassian.net/rest/api/2/issue/createmeta
   */