const aliases = {
  key: ['key', 'issue key'],
  summary: ['summary', 'title'],
  status: ['status'],
  points: ['story points', 'story point estimate'],
  grouping: ['group', 'grouping', 'parent', 'epic'],
  blocks: ['blocks', 'outward issue link (blocks)'],
  blockedBy: ['blocked by', 'is blocked by', 'inward issue link (blocks)'],
};

function normaliseHeader(value) {
  return value.trim().toLowerCase();
}

function parseCsvLine(line) {
  const values = [];
  let value = '';
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];

    if (character === '"') {
      if (quoted && line[index + 1] === '"') {
        value += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === ',' && !quoted) {
      values.push(value);
      value = '';
    } else {
      value += character;
    }
  }

  values.push(value);
  return values;
}

function splitRow(line, delimiter) {
  return delimiter === '\t' ? line.split('\t') : parseCsvLine(line);
}

function matchingIndexes(headers, names) {
  return headers
    .map((header, index) => (names.includes(header) ? index : -1))
    .filter((index) => index >= 0);
}

function firstValue(row, indexes) {
  for (const index of indexes) {
    const value = (row[index] ?? '').trim();
    if (value) return value;
  }
  return '';
}

function dependencyValues(row, indexes) {
  return [...new Set(indexes
    .flatMap((index) => (row[index] ?? '').split(/[,;]/))
    .map((value) => value.trim())
    .filter(Boolean))];
}

export function parseSpreadsheetRows(input) {
  const lines = input
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .filter((line) => line.trim().length > 0);

  if (lines.length < 2) {
    throw new Error('Paste a header row and at least one Jira issue row.');
  }

  const delimiter = lines[0].includes('\t') ? '\t' : ',';
  const headers = splitRow(lines[0], delimiter).map(normaliseHeader);
  const indexes = Object.fromEntries(
    Object.entries(aliases).map(([name, names]) => [name, matchingIndexes(headers, names)]),
  );

  if (!indexes.key.length) {
    throw new Error('A Key or Issue key column is required.');
  }

  return lines.slice(1).map((line, rowIndex) => {
    const row = splitRow(line, delimiter);
    const key = firstValue(row, indexes.key);

    if (!key) {
      throw new Error(`Row ${rowIndex + 2} is missing an issue key.`);
    }

    const summary = firstValue(row, indexes.summary) || key;
    const points = firstValue(row, indexes.points);

    return {
      key,
      title: points ? `${summary} (${points})` : summary,
      status: firstValue(row, indexes.status),
      grouping: firstValue(row, indexes.grouping) || 'Ungrouped',
      blocks: dependencyValues(row, indexes.blocks),
      'is blocked by': dependencyValues(row, indexes.blockedBy),
    };
  });
}
