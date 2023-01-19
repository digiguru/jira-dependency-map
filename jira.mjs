import chalk from 'chalk'
import JiraApi from 'jira-client';

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
export async function connect ({server, username, password, query, number}) {
    const data = await queryJira({server, username, password, query, number});
    const issues = data.issues;
    console.log(`Query returns ${issues.length}`);
}

/*
curl -D- \
   -u fred@example.com:freds_api_token \
   -X GET \
   -H "Content-Type: application/json" \
   https://your-domain.atlassian.net/rest/api/2/issue/createmeta
   */