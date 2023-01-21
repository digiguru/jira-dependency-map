export function remapTickets (columns, tickets, keyName) {
   return tickets.map(ticket => {
        const change = columns.find(column => column.input.includes(ticket[keyName]));
        if (change) {
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