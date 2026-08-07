import dotenv from 'dotenv';
import { queryJira } from './queryJira.mjs';
import { parseMultipleBlockers } from './parse.mjs';
import { remapTickets } from './remapper.mjs';

dotenv.config();

const {
  JIRA_SERVER: server,
  JIRA_USERNAME: username,
  JIRA_PASSWORD: password,
  JIRA_QUERY: query,
  JIRA_NUMBER: number,
} = process.env;

const map = {
  blockers: {
    value: 'fields.customfield_10000',
    default: [],
  },
  key: 'key',
  summary: 'fields.summary',
  status: 'fields.status.name',
  type: 'fields.issuetype.name',
};

export async function getJiraDependencies({
  server,
  username,
  password,
  query,
  number,
  map,
}) {
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

if (process.argv[1] === new URL(import.meta.url).pathname) {
  getJiraDependencies({
    server,
    username,
    password,
    query,
    number,
    map,
  }).then(console.log);
}
