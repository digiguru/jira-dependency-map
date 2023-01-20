
const groupings = ['grouping'];
export function toDot(inputItems){
    if(!inputItems.length) {
        inputItems = [inputItems];
    }
    let text;
    const itemsWithGroups = inputItems.find(x => x && x[groupings[0]]);
    const itemsWithBlocks = inputItems.find(x => x['is blocked by'] || x['blocks']);
    let lines = [];
    if(itemsWithGroups) {
        lines = lines.concat(toDotLinesWithGroups(inputItems));
        
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
    return `digraph graphname {
        rankdir=LR
        TBbalance="min"\n${text}}`;
}

export function removeDashes(input) {
    if(input) {
        return input.replace('-','');
    } else {
        return '';
    }
    
}
class GroupNotation {
    constructor() {
        this.index = 0;
        this.orphandGroupName = "Others";
    }
    toDot(groupName, listItems) {
        const lines = toDotLinesNoDependencies(listItems);
        
        return `subgraph cluster_${this.index++} {
  style=filled;
  color=lightgrey;
  node [style=filled,color=white];
  label = "${groupName}";
${lines.join("")}}
`;
    }    
}

function toDotLinesWithGroups(inputItems) {
    let lines = [];
    let groupNotation = new GroupNotation();
    
    
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
    let nonGroupStories = [];
    
    let groups = inputItems.reduce(function (total, next) {
        let groupName = next[groupings[0]] || groupNotation.orphandGroupName;
        let newItemIndex = total.findIndex(v => v.name === groupName);
        if(newItemIndex === -1) {
           total.push({name: groupName, items: [next]});
        } else {
           total[newItemIndex].items.push(next);
        }
        return total;
    }, []);
    groups.forEach( group => {
        let groupName = group.name;
        let stories = group.items;
        let storyKeys = stories.map(x => x.key);
        let notInGroup = linkedStories.filter(x => !storyKeys.includes(x)).map(x => { return {key:x}});
        lines.push(groupNotation.toDot(groupName, stories));
        
        nonGroupStories = [...nonGroupStories, ...notInGroup];
       
        
        linkedStories = linkedStories.filter(v => linkedStories.includes(v.key))
    });
    if(nonGroupStories.length) {
        lines.push(groupNotation.toDot(groupNotation.orphandGroupName, nonGroupStories));
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
    if(input.title || input.colour) {
        let lines = [];
        lines.push(`${text} [\n`);
        if(input.title) lines.push(`label="${input.title}"\n`);
        if(input.colour) lines.push(`color="${input.colour}"\n`);
        lines.push("shape=box\n")
        lines.push(`];\n`);
        return lines.join("");
    }
}
function toDotLineNoDependencies(input) {
    const text = removeDashes(input.key);
    if(input.title || input.colour) {
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