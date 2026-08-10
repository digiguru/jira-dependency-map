import { describe, it } from 'node:test';
import { expect } from 'chai';
import { queryJira } from './jira.mjs';

describe('Jira API client', () => {
  it('uses the current enhanced JQL endpoint and preserves the result limit', async () => {
    let request;
    const expected = {issues: [{key: 'DEMO-1'}]};

    const result = await queryJira(
      {
        server: 'example.atlassian.net',
        username: 'person@example.com',
        password: 'api-token',
        query: 'project = DEMO',
        number: '25'
      },
      async (url, options) => {
        request = {url, options};
        return {
          ok: true,
          json: async () => expected
        };
      }
    );

    expect(result).to.deep.equal(expected);
    expect(request.url.toString()).to.equal('https://example.atlassian.net/rest/api/3/search/jql');
    expect(request.options).to.deep.include({method: 'POST'});
    expect(request.options.headers).to.deep.include({
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: 'Basic cGVyc29uQGV4YW1wbGUuY29tOmFwaS10b2tlbg=='
    });
    expect(JSON.parse(request.options.body)).to.deep.equal({
      jql: 'project = DEMO',
      maxResults: 25
    });
  });

  it('includes Jira error details in failed request errors', async () => {
    let error;

    try {
      await queryJira(
        {
          server: 'example.atlassian.net',
          username: 'person@example.com',
          password: 'api-token',
          query: 'project = DEMO',
          number: '25'
        },
        async () => ({
          ok: false,
          status: 401,
          statusText: 'Unauthorized',
          json: async () => ({errorMessages: ['Invalid credentials']})
        })
      );
    } catch (caught) {
      error = caught;
    }

    expect(error).to.be.an.instanceOf(Error);
    expect(error.message).to.include('401 Unauthorized');
    expect(error.message).to.include('Invalid credentials');
  });
});
