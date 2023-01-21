
import {remapTickets} from './remapper.mjs';
import {expect} from 'chai';

describe('Status Mapper', () => {
    it('Renames card statuses based on their mappings', () => {

        const columnMappings = [
            {'input': ['Ready for Development'], 
                'output': 'Todo'}
        ];
    
        const tickets = [
            {
                "key": "WED-7453", 
                "status": "Ready for Development", 
                "summary": "Generate the regression test suite for the app"
            }
        ];
    
        const output = remapTickets(columnMappings, tickets, 'status');
        expect(output).to.have.lengthOf(1);
        expect(output[0]).to.deep.include(
            {
                "key": "WED-7453", 
                "status": "Todo", 
                "summary": "Generate the regression test suite for the app"
            });
    
    });
    
    it('Puts dynamic objects in based on mappings', () => {
    
        const columnMappings = [
            {'input': ['Ready for Development'], 
                'output': {'colour': '#0000ff'}}
        ];
    
        const tickets = [
            {
                "key": "WED-7453", 
                "status": "Ready for Development", 
                "summary": "Generate the regression test suite for the app"
            }
        ];
        const output = remapTickets(columnMappings, tickets, 'status');
        expect(output).to.have.lengthOf(1);
        
        expect(output[0]).to.deep.include(
            {
                "key": "WED-7453", 
                'colour': '#0000ff', 
                "summary": "Generate the regression test suite for the app"
            }
        );
    
    });

    it('Does not require an array of values', () => {
    
        const columnMappings = [
            {'input': 'Ready for Development', 
                'output': {'colour': '#0000ff'}}
        ];
    
        const tickets = [
            {
                "key": "WED-7453", 
                "status": "Ready for Development", 
                "summary": "Generate the regression test suite for the app"
            }
        ];
        const output = remapTickets(columnMappings, tickets, 'status');
        expect(output).to.have.lengthOf(1);
        
        expect(output[0]).to.deep.include(
            {
                "key": "WED-7453", 
                'colour': '#0000ff', 
                "summary": "Generate the regression test suite for the app"
            }
        );
    
    });
    
});


