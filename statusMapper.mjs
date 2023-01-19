export function remapTickets (columns, tickets) {
   return tickets.map(ticket => {
        const statusChange = columns.find(column => column.input.includes(ticket.status));
        if (statusChange) {
            if(typeof statusChange.output === 'object') {
                return {
                    ...ticket,
                    ...statusChange.output
                }
            } else {
                return {
                    ...ticket,
                    status: statusChange.output
                }
            }
        } else {
            return ticket;
        }
    });
}