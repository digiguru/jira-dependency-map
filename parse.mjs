
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
const lookup = {
    key: {value:"key"},
    additional: {value:"fields.customfield_10004", default: "unestimated"},
    text: {value:"fields.summary"},
    status: {value:"fields.status.name"},
    grouping: {value:"fields.parent.fields.summary"}
}
export function parseBlocker(targetIssue) {
    const key = resolvePath(targetIssue, lookup.key.value);
    const additional = resolvePath(targetIssue, lookup.additional.value) || lookup.additional.default;
    const text = resolvePath(targetIssue, lookup.text.value) || key;
    const keys =  {
        'blocks': [],
        'is blocked by': [],
        'key': key,
        'grouping': resolvePath(targetIssue, lookup.grouping.value),
        'status': resolvePath(targetIssue, lookup.status.value),
        'title': text + (additional ? ` (${additional})` : ""),
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