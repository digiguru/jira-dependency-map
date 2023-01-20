export function toDot(inputItems){
    if(!inputItems.length) {
        inputItems = [inputItems];
    }
    let text;
    const itemsWithEpics = inputItems.find(x => x && x.epic);
    const itemsWithBlocks = inputItems.find(x => x['is blocked by'] || x['blocks']);
    let lines = [];
    if(itemsWithEpics) {
        lines = lines.concat(toDotLinesWithEpics(inputItems));
        
        if(itemsWithBlocks) {
            lines = lines.concat(toDotLines(inputItems).sort((a,b) => {
                return a.localeCompare(b);
            }));
        }
    } else {
        lines = lines.concat(toDotLines(inputItems).sort((a,b) => {
            return a.localeCompare(b);
        }));
    }
    text = lines.join("");
    return `digraph graphname {\n${text}}`;
}

export function removeDashes(input) {
    if(input) {
        return input.replace('-','');
    } else {
        return '';
    }
    
}
class EpicNotation {
    constructor() {
        this.index = 0;
        this.orphandEpicName = "Others";
    }
    toDot(epicName, listItems) {
        const lines = toDotLinesNoDependencies(listItems);
        
        return `subgraph cluster_${this.index++} {
  style=filled;
  color=lightgrey;
  node [style=filled,color=white];
  label = "${epicName}";
${lines.join("")}}
`;
    }    
}

function toDotLinesWithEpics(inputItems) {
    let lines = [];
    let epicNotation = new EpicNotation();
    
    
    let blocksStories = inputItems
        .filter(x => x.blocks) // Only get things that are blocked 
        .map(x => x.blocks)
        .reduce((original,next) => [...original,...next], []);

    let blockedByStories =  inputItems
        .filter(x => x['is blocked by']) // Only get things that are blocked 
        .map(x => x['is blocked by'])
        .reduce((original,next) => [...original,...next], []);
    
    let linkedStories = [...blocksStories, ...blockedByStories];
    
    //[].splice()
    let nonEpicStories = [];
    
    let epics = inputItems.reduce(function (total, next) {
        let epicName = next.epic || epicNotation.orphandEpicName;
        let newItemIndex = total.findIndex(v => v.name === epicName);
        if(newItemIndex === -1) {
           total.push({name: epicName, items: [next]});
        } else {
           total[newItemIndex].items.push(next);
        }
        return total;
    }, []);
    epics.forEach( epic => {
        let epicName = epic.name;
        let stories = epic.items;
        let storyKeys = stories.map(x => x.key);
        let notInEpic = linkedStories.filter(x => !storyKeys.includes(x)).map(x => { return {key:x}});
        lines.push(epicNotation.toDot(epicName, stories));
        
        nonEpicStories = [...nonEpicStories, ...notInEpic];
       
        
        linkedStories = linkedStories.filter(v => linkedStories.includes(v.key))
    });
    if(nonEpicStories.length) {
        lines.push(epicNotation.toDot(epicNotation.orphandEpicName, nonEpicStories));
    }
    return [...new Set(lines)];
}

function toDotLines(inputItems) {
    let lines = [];
    inputItems
        .forEach(input => {
            lines.push(...toDotLine(input));
        });
    //Dedupe
    return [...new Set(lines)];
}
function toDotLinesNoDependencies(inputItems) {
    
    let lines = [];
    inputItems
        .sort((a,b) => {
            return a.key.localeCompare(b.key);
        })
        .forEach(input => {
            if(input) {
                lines.push(toDotLineNoDependencies(input));
            }
        });
    //Dedupe
    return [...new Set(lines)];
}
function toDotExtraInfo(input) {
    const text = removeDashes(input.key);
    if(input.summary || input.colour) {
        let lines = [];
        lines.push(`${text} [\n`);
        if(input.summary) lines.push(`label="${input.summary}"\n`);
        if(input.colour) lines.push(`color="${input.colour}"\n`);
        lines.push(`];\n`);
        return lines.join("");
    }
}
function toDotLineNoDependencies(input) {
    const text = removeDashes(input.key);
    if(input.summary || input.colour) {
        return `{\n ${toDotExtraInfo(input)}\n}\n`;
    } else {
        return `  ${text};\n`;
    }
    
}
function toDotLine(input) {
    let lines = [];
    
    if(input['is blocked by']) {
        input['is blocked by'].forEach( blocker => {
            lines.push(`  ${removeDashes(blocker)} -> ${removeDashes(input.key)};\n`);
        });
    }
    if(input.blocks) {
        input.blocks.forEach( blocker => {
            lines.push(`  ${removeDashes(input.key)} -> ${removeDashes(blocker)};\n`);
        });
    }
    if(!lines.length) {
        lines.push(toDotLineNoDependencies(input));
    } else {
        lines.push(toDotExtraInfo(input))
    }
    return lines;
}