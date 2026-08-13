import { instance } from '@viz-js/viz';
import { remapTickets } from '/core/remapper.mjs';
import { toDot } from '/core/toDot.mjs';
import { parseSpreadsheetRows } from '/web/spreadsheetParser.mjs';

const statusMappings = [
  { input: ['Backlog', 'Ready For Shaping', 'Ready for Development'], output: { colour: '#cc00ff' } },
  { input: ['Doing', 'Review', 'Testing'], output: { colour: '#FFFF00' } },
  { input: ['Build', 'Released'], output: { colour: '#00FF00' } },
];

const rows = document.getElementById('rows');
const graph = document.getElementById('graph');
const message = document.getElementById('message');
const model = document.getElementById('model');
const dotOutput = document.getElementById('dot');

let vizPromise;

function viz() {
  vizPromise ??= instance();
  return vizPromise;
}

function showError(error) {
  console.error(error);
  message.setAttribute('role', 'alert');
  message.textContent = error instanceof Error ? error.message : String(error);
}

async function renderRows() {
  message.removeAttribute('role');
  message.textContent = 'Rendering…';

  try {
    const parsed = parseSpreadsheetRows(rows.value);
    const mapped = remapTickets(statusMappings, parsed, 'status');
    const dot = toDot(mapped);
    const renderer = await viz();
    const svg = renderer.renderString(dot, { format: 'svg' });

    graph.innerHTML = svg;
    model.textContent = JSON.stringify(mapped, null, 2);
    dotOutput.textContent = dot;
    message.textContent = `Rendered ${mapped.length} issues using the CLI dependency-map engine.`;
  } catch (error) {
    showError(error);
  }
}

async function loadMockRows() {
  const response = await fetch('/mock-jira-data.tsv');
  if (!response.ok) throw new Error(`Unable to load mock rows (${response.status}).`);
  rows.value = await response.text();
}

document.getElementById('render').addEventListener('click', renderRows);
document.getElementById('load-mock').addEventListener('click', async () => {
  try {
    await loadMockRows();
    await renderRows();
  } catch (error) {
    showError(error);
  }
});
document.getElementById('copy-rows').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(rows.value);
    message.removeAttribute('role');
    message.textContent = 'Spreadsheet rows copied.';
  } catch (error) {
    showError(error);
  }
});

try {
  await loadMockRows();
  await renderRows();
} catch (error) {
  showError(error);
}
