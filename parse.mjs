
const resolvePath = function (object, path, defaultValue) {
    return path
        .split('.')
        .reduce((o, p) => o ? o[p] : defaultValue, object)
}



export function parseBlockers(data, key) {
    const tickets = data.length ? data : data.issues;
    const targetIssue = tickets.find( ticket => {
        return ticket.key === key;
    });
    return parseBlocker(targetIssue);
}

export function parseBlocker(targetIssue) {
    const key = resolvePath(targetIssue, "key");
    const additional = resolvePath(targetIssue, "fields.customfield_10004");
    const keys =  {
        'blocks': [],
        'is blocked by': [],
        'key': key,
        'grouping': resolvePath(targetIssue, "fields.parent.fields.summary"),
        'status': resolvePath(targetIssue,"fields.status.name"),
        'title': (resolvePath(targetIssue,"fields.summary") || key) + " (" + (additional || "unestimated") + ")",
    }
    if(targetIssue && targetIssue.fields) {
        if(targetIssue.fields.issuelinks) {
            targetIssue.fields.issuelinks.forEach( link => {
                if (link.outwardIssue && link.type && link.type.name === "Blocks") {
                    keys['blocks'].push(link.outwardIssue.key);
                }
                if (link.inwardIssue && link.type && link.type.name === "Blocks") {
                    keys['is blocked by'].push(link.inwardIssue.key);
                }
            });
        }

    }
    return keys;
}
export function parseMultipleBlockers(data) {
    const tickets = data.length ? data : data.issues;
    return tickets.map(v => {
        return parseBlocker(v);
    });
}