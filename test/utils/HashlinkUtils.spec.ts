import {HashlinkUtils} from "../../lib/utils/HashlinkUtils";

describe('should test HashlinkUtils functions', () => {
    it('should return ok if hashlink URL encoded exists', () => {
        const url = 'hl:zm9YZpCjPLPJ4Epc:z3TSgXTuaHxY2tsArhUreJ4ixgw9NW7DYuQ9QTPQyLHy';
        const result = HashlinkUtils.containsHashlink(url);
        expect(result).toBe(true);
    });

    it('should return ok if hashlink Query URL exists', () => {
        let url = 'https://example.com/hw.txt?hl=zm9YZpCjPLPJ4Epc';
        let result = HashlinkUtils.containsHashlink(url);
        expect(result).toBe(true);
        url = 'https://example.com/hw.txt?hl=zm9YZpCjPLPJ4Epc&name=something';
        result = HashlinkUtils.containsHashlink(url);
        expect(result).toBe(true);
        url = 'https://example.com/hw.txt?name=something&hl=zm9YZpCjPLPJ4Epc';
        result = HashlinkUtils.containsHashlink(url);
        expect(result).toBe(true);
    });

    it('should return ok if hashlink doesn\'t exist', () => {
        let url = 'https://example.com/hw.txt';
        let result = HashlinkUtils.containsHashlink(url);
        expect(result).toBe(false);
        url = 'https://example.com/hw.txt?h=zm9YZpCjPLPJ4Epc'
        result = HashlinkUtils.containsHashlink(url);
        expect(result).toBe(false);
        url = 'h:zm9YZpCjPLPJ4Epc:z3TSgXTuaHxY2tsArhUreJ4ixgw9NW7DYuQ9QTPQyLHy'
        result = HashlinkUtils.containsHashlink(url);
        expect(result).toBe(false);
    });

    it('should return ok if hashlink verifies', async function () {
        const url = "https://schema.org/docs/jsonldcontext.json.txt?hl=zm9YZpCjPLPJ4Epc";
        const result = await HashlinkUtils.verifyHashlink(url);
        console.log(result)
    });
});