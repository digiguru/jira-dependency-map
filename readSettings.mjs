import fs from 'fs'
import YAML from 'yaml'

export function readSettings(path, commandLineParams) {
    let fileParams = {}
    if(path) {
        const file = fs.readFileSync(path, 'utf8');
        fileParams = YAML.parse(file);
    }
    const over =  {...fileParams,...commandLineParams};
    console.log(JSON.stringify(over, null,2))
    return over;
}