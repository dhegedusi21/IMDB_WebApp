import dsPromise from "fs/promises";

type tipKonf = {
	jwtValjanost: string;
	jwtTajniKljuc: string;
	tajniKljucSesija: string;
	tmdbApiKeyV3: string;
	tmdbApiKeyV4: string;
};

export class Konfiguracija {
	private konf: tipKonf;
	constructor() {
		this.konf = this.initKonf();
	}
	private initKonf() {
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

	public async ucitajKonfiguraciju() {
		if (process.argv[2] == undefined) {
			throw new Error("Nedostaje putanja do konfiguracijske datoteke!");
		}

		let putanja: string = process.argv[2];
		let podaci = await dsPromise.readFile(putanja, { encoding: "utf-8" });
		this.pretvoriJSONkonfig(podaci);
		this.provjeriPodatkeKonfiguracije();
		console.log(this.konf);
	}

	private pretvoriJSONkonfig(podaci: string) {
		console.log(podaci);
		let konf: { [kljuc: string]: string } = {};
		var nizPodataka = podaci.split("\n");
		for (let podatak of nizPodataka) {
			var podatakNiz = podatak.split("=");
			var naziv = podatakNiz[0];
			if (typeof naziv != "string" || naziv == "") continue;
			var vrijednost: string = podatakNiz[1] ?? "";
			konf[naziv] = vrijednost;
		}
		this.konf = konf as tipKonf;
	}

	private provjeriPodatkeKonfiguracije() {
		if (
			this.konf.tmdbApiKeyV3 == undefined ||
			this.konf.tmdbApiKeyV3.trim() == ""
		) {
			throw new Error("Fali TMDB API ključ u tmdbApiKeyV3");
		}
		if (
			this.konf.jwtValjanost == undefined ||
			this.konf.jwtValjanost.trim() == ""
		) {
			throw new Error("Fali JWT valjanost");
		}
		if (
			this.konf.jwtTajniKljuc == undefined ||
			this.konf.jwtTajniKljuc.trim() == ""
		) {
			throw new Error("Fali JWT tajni kljuc");
		}
	}
}
