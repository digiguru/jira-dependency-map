export function parseBlockers(data, key) {
    const tickets = data.length ? data : data.issues;
    const targetIssue = tickets.find( ticket => {
        return ticket.key === key;
    });
    return parseBlocker(targetIssue);
}

export function parseBlocker(targetIssue) {
    const keys = {
        'blocks': [],
        'is blocked by': [],
        'key': targetIssue.key,
        'epic': targetIssue.fields?.customfield_11100,
        'status': targetIssue.fields?.status?.name,
        'summary': `${targetIssue.fields?.summary || targetIssue.key} (${ targetIssue.fields?.customfield_10004 || "unestimated"})`
    };
        
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