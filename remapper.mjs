export function remapTickets (columns, tickets, keyName) {
    console.log("REMAP", keyName, columns);
   return tickets.map(ticket => {
        const change = columns.find(column => {
            if(Array.isArray(column.input)) {
                return column.input.includes(ticket[keyName])
            } else {
                return column.input === ticket[keyName];
            }
        });
        if (change) {
            console.log("CHANGE", keyName, change);
            if(typeof change.output === 'object') {
                return {
                    ...ticket,
                    ...change.output
                }
            } else {
                return {
                    ...ticket,
                    [keyName]: change.output
                }
            }
        } else {
            return ticket;
        }
    });
}