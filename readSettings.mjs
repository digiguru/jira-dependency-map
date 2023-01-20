import fs from 'fs'
import YAML from 'yaml'

export function readSettings(path, commandLineParams) {
    let fileParams = {}
    if(path) {
        const file = fs.readFileSync(path, 'utf8');
        fileParams = YAML.parse(file);
    }
    return {...fileParams,...commandLineParams};
}