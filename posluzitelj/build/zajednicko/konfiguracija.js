import dsPromise from "fs/promises";
export class Konfiguracija {
    konf;
    constructor() {
        this.konf = this.initKonf();
    }
    initKonf() {
        return {
            jwtTajniKljuc: "",
            jwtValjanost: "",
            tajniKljucSesija: "",
            tmdbApiKeyV3: "6dcd62df0abdcaf0dcbf6b1f722c59f3",
            tmdbApiKeyV4: "",
        };
    }
    dajKonf() {
        return this.konf;
    }
    async ucitajKonfiguraciju() {
        if (process.argv[2] == undefined) {
            throw new Error("Nedostaje putanja do konfiguracijske datoteke!");
        }
        let putanja = process.argv[2];
        let podaci = await dsPromise.readFile(putanja, { encoding: "utf-8" });
        this.pretvoriJSONkonfig(podaci);
        this.provjeriPodatkeKonfiguracije();
        console.log(this.konf);
    }
    pretvoriJSONkonfig(podaci) {
        console.log(podaci);
        let konf = {};
        var nizPodataka = podaci.split("\n");
        for (let podatak of nizPodataka) {
            var podatakNiz = podatak.split("=");
            var naziv = podatakNiz[0];
            if (typeof naziv != "string" || naziv == "")
                continue;
            var vrijednost = podatakNiz[1] ?? "";
            konf[naziv] = vrijednost;
        }
        this.konf = konf;
    }
    provjeriPodatkeKonfiguracije() {
        if (this.konf.tmdbApiKeyV3 == undefined ||
            this.konf.tmdbApiKeyV3.trim() == "") {
            throw new Error("Fali TMDB API ključ u tmdbApiKeyV3");
        }
        if (this.konf.jwtValjanost == undefined ||
            this.konf.jwtValjanost.trim() == "") {
            throw new Error("Fali JWT valjanost");
        }
        if (this.konf.jwtTajniKljuc == undefined ||
            this.konf.jwtTajniKljuc.trim() == "") {
            throw new Error("Fali JWT tajni kljuc");
        }
    }
}
