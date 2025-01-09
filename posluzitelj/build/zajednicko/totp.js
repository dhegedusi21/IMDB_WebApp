import { kreirajSHA256, dajNasumceBroj, hexToUint8Array } from "../zajednicko/kodovi.js";
import base32 from "base32-encoding";
export function kreirajTajniKljuc(korime) {
    let tekst = korime + new Date() + dajNasumceBroj(10000000, 90000000);
    let hash = hexToUint8Array(kreirajSHA256(tekst));
    let tajniKljuc = base32.stringify(hash, "ABCDEFGHIJKLMNOPRSTQRYWXZ234567");
    return tajniKljuc.toUpperCase();
}
