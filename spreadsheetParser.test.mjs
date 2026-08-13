import { describe, it } from 'node:test';
import { expect } from 'chai';
import { parseSpreadsheetRows } from './web/spreadsheetParser.mjs';

describe('spreadsheet parser', () => {
  it('parses tab-separated rows into the CLI dependency model', () => {
    const input = [
      'Key\tSummary\tStatus\tStory Points\tGroup\tBlocks\tBlocked By',
      'DEMO-1\tFirst issue\tDoing\t5\tPlatform\tDEMO-2, DEMO-3\t',
      'DEMO-2\tSecond issue\tBacklog\t3\tWeb\t\tDEMO-1',
    ].join('\n');

    expect(parseSpreadsheetRows(input)).to.deep.equal([
      { key: 'DEMO-1', title: 'First issue (5)', status: 'Doing', grouping: 'Platform', blocks: ['DEMO-2', 'DEMO-3'], 'is blocked by': [] },
      { key: 'DEMO-2', title: 'Second issue (3)', status: 'Backlog', grouping: 'Web', blocks: [], 'is blocked by': ['DEMO-1'] },
    ]);
  });

  it('accepts Jira-style aliases and repeated link columns', () => {
    const input = [
      'Issue key\tSummary\tStatus\tStory point estimate\tParent\tOutward issue link (Blocks)\tOutward issue link (Blocks)\tInward issue link (Blocks)',
      'DEMO-10\tJira-shaped row\tTesting\t8\tEpic Alpha\tDEMO-11\tDEMO-12\tDEMO-9',
    ].join('\n');

    expect(parseSpreadsheetRows(input)[0]).to.deep.equal({
      key: 'DEMO-10', title: 'Jira-shaped row (8)', status: 'Testing', grouping: 'Epic Alpha',
      blocks: ['DEMO-11', 'DEMO-12'], 'is blocked by': ['DEMO-9'],
    });
  });

  it('supports quoted CSV when tabs are not present', () => {
    const input = [
      'Key,Summary,Status,Group,Blocks',
      'DEMO-20,"Summary, with comma",Released,Platform,DEMO-21',
    ].join('\n');

    expect(parseSpreadsheetRows(input)[0]).to.include({
      key: 'DEMO-20', title: 'Summary, with comma', status: 'Released', grouping: 'Platform',
    });
  });

  it('uses Ungrouped when no grouping value is supplied', () => {
    expect(parseSpreadsheetRows('Key\tSummary\nDEMO-30\tStandalone')[0].grouping).to.equal('Ungrouped');
  });

  it('requires an issue key column', () => {
    expect(() => parseSpreadsheetRows('Summary\tStatus\nMissing key header\tBacklog'))
      .to.throw('A Key or Issue key column is required.');
  });

  it('reports the row when an issue key is missing', () => {
    expect(() => parseSpreadsheetRows('Key\tSummary\n\tMissing key value'))
      .to.throw('Row 2 is missing an issue key.');
  });
});
