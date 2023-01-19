import chalk from 'chalk'
import JiraApi from 'jira-client';

function connectJira({server, username, password, query}) {
  return new JiraApi({
    protocol: 'https',
    host: server,
    username: username,
    password: password,
    apiVersion: '3',
    strictSSL: true
  });
}
export async function connect  ({server, username, password, query}) {

    const jira =  connectJira({server, username, password, query});
    const data = await jira.searchJira(query)
    console.log(JSON.stringify(data))
}
/*
curl -D- \
   -u fred@example.com:freds_api_token \
   -X GET \
   -H "Content-Type: application/json" \
   https://your-domain.atlassian.net/rest/api/2/issue/createmeta
   */