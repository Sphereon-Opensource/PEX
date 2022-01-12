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
        const url = "https://schema.org/docs/jsonldcontext.json.txt?hl=E4D9C4E6736A236480A184A630D44A0E0BC4FA688D76B53CE15D039A26896D15685A6FEF22770D461FBF3ACC7C689A68BCF297D733EBBFB88A039608CAF36262";
        const result = await HashlinkUtils.verifyHashlink(url);
        console.log(result)
    });
});