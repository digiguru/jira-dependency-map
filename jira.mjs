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
function getMaxResults(number) {
  const maxResults = Number(number);
  if (!Number.isSafeInteger(maxResults) || maxResults < 1) {
    throw new Error('The number of results must be a positive integer.');
  }
  return maxResults;
}

function getSearchUrl(server) {
  const baseUrl = new URL(server.includes('://') ? server : `https://${server}`);
  if (baseUrl.protocol !== 'https:') {
    throw new Error('The Jira server URL must use HTTPS.');
  }
  return new URL('/rest/api/3/search/jql', baseUrl);
}

export async function queryJira({server, username, password, query, number}, fetchImpl = fetch) {
  const response = await fetchImpl(getSearchUrl(server), {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Basic ${Buffer.from(`${username}:${password}`, 'utf8').toString('base64')}`
    },
    body: JSON.stringify({
      jql: query,
      maxResults: getMaxResults(number)
    })
  });
  const data = await response.json();

  if (!response.ok) {
    const message = Array.isArray(data.errorMessages)
      ? data.errorMessages.join('; ')
      : data.message;
    throw new Error(`Jira search failed (${response.status} ${response.statusText}): ${message || 'No error details returned'}`);
  }

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
  
  Object.keys(settings).forEach((key) => {
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
