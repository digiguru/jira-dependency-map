import { spawnSync } from 'node:child_process';
import { describe, it } from 'node:test';
import { expect } from 'chai';

describe('CLI', () => {
  it('loads and runs the version command', () => {
    const result = spawnSync(process.execPath, ['index.mjs', 'version'], {
      encoding: 'utf8'
    });

    expect(result.status).to.equal(0);
    expect(result.stdout).to.include('Welcome. Running version 0.1.0');
    expect(result.stderr).to.equal('');
  });
});
