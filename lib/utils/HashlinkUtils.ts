import PEMessages from "../types/Messages";
import {defaultCodecs, Hashlink} from "@transmute/hl";
import fetch from 'cross-fetch';
import {ObjectUtils} from "./ObjectUtils";
// import jsonld from "jsonld";
// import {stringToUint8Array} from "@transmute/hl/dist/util";

export class HashlinkUtils {
    private static HASHLINK_URL_ENCODED_REGEX = /hl:[a-zA-Z0-9]+:[a-zA-Z0-9]+/g;
    private static HASHLINK_QUERY_URL_REGEX =
        /https*?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)(hl=[a-zA-Z0-9]+)/g;

    public static containsHashlink(value: string): boolean {
        return !(value.matchAll(this.HASHLINK_QUERY_URL_REGEX).next().done &&
            value.matchAll(this.HASHLINK_URL_ENCODED_REGEX).next().done);
    }

    public static async verifyHashlink(value: string): Promise<boolean> {
        try {
            const hl = new Hashlink();
            /*if (!value.matchAll(this.HASHLINK_URL_ENCODED_REGEX).next().done) {
                const hlData = hl.verify(value);
                console.log(hlData);
            } else */
            if (!value.matchAll(this.HASHLINK_QUERY_URL_REGEX).next().done) {
                const params = (new URL(value)).searchParams;
                const hash = params.get("hl");
                const hlInstance = new Hashlink();
                hlInstance.use(new defaultCodecs.MultihashSha2256());
                hlInstance.use(new defaultCodecs.MultibaseBase58btc());
                const res = await fetch(value);
                const data = await res.text();
                console.log("data:", data);
                /*const encodeResult = await hlInstance.encode({
                    data: JSON.stringify(data),
                    codecs: ['mh-sha2-256', 'mb-base58-btc']
                });
                console.log("encodeResult:",encodeResult);*/
                const multibaseEncodedMultihash = ObjectUtils.stringToUint8Array(data);
                await hl.verify({data: multibaseEncodedMultihash, hashlink: hash as string});
            }
        } catch (er) {
            throw new Error(PEMessages.OPTIONAL_HASHLINK_DEPENDENCY_NEEDED);
        }
        return false;
    }
}
/*

class Urdna2015 {
    public identifier: any;
    public algorithm: any;

    constructor() {
        this.identifier = stringToUint8Array('urdna2015');
        this.algorithm = 'urdna2015';
    }

    async encode(input: any) {
        const inputJsonld = JSON.parse(new TextDecoder().decode(input));
        return stringToUint8Array(
          await jsonld.canonize(inputJsonld, { format: 'application/n-quads' })
        );
    }
}*/
