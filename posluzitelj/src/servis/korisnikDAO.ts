import { KorisnikI } from "../servisI/korisniciI.js";
import Baza from "../zajednicko/sqliteBaza.js";

export class KorisnikDAO {
  private baza:Baza;

	constructor() {
		this.baza = new Baza("podaci/RWA2024dhegedusi21_servis.sqlite");
	}

    async dajSve():Promise<Array<KorisnikI>> {
        let sql = `
            SELECT k.*, 
            CASE WHEN z.status = 'prihvacen' THEN 1 ELSE 0 END as status_servisa 
            FROM korisnik k 
            LEFT JOIN zahtjev_servisa z ON k.korime = z.korime;
        `;
        var podaci = await this.baza.dajPodatkePromise(sql,[]) as Array<KorisnikI>;
        let rezultat = new Array<KorisnikI>();
        for(let p of podaci){
            let k:KorisnikI = {
                ime: p["ime"], 
                prezime: p["prezime"], 
                korime: p["korime"],
                lozinka: p["lozinka"],
                email: p["email"],
                tip_korisnika_id: p["tip_korisnika_id"],
                status_servisa: p["status_servisa"]
            };
            rezultat.push(k);
        }
        return rezultat;
    }

	async daj (korime:string):Promise<KorisnikI|null> {
		let sql = "SELECT * FROM korisnik WHERE korime=?;"
		var podaci = await this.baza.dajPodatkePromise(sql, [korime]) as Array<KorisnikI>;

		if(podaci.length == 1 && podaci[0]!=undefined){
      let p = podaci[0];
      let k:KorisnikI = {ime: p["ime"], prezime:p["prezime"], korime:p["korime"],lozinka:p["lozinka"],email:p["email"],tip_korisnika_id: p["tip_korisnika_id"],                status_servisa: p["status_servisa"]
	  };
			return k;
    }

    return null;
	}

	dodaj(korisnik:KorisnikI) {
		console.log(korisnik)
		let sql = "INSERT INTO korisnik (ime, prezime, korime, lozinka, email, tip_korisnika_id) VALUES (?, ?, ?, ?, ?, 2)";
		let podaci = [korisnik.ime, korisnik.prezime, korisnik.korime, korisnik.lozinka, korisnik.email];
	  this.baza.ubaciAzurirajPodatke(sql,podaci);
		return true;
	}

	obrisi(korime:string) {
        let sql = "DELETE FROM zahtjev_servisa WHERE korime=?";
        this.baza.ubaciAzurirajPodatke(sql,[korime]);
		let sql2 = "DELETE FROM korisnik WHERE korime=?";
		this.baza.ubaciAzurirajPodatke(sql2,[korime]);
		return true;
	}

	azuriraj(korime:string, korisnik:KorisnikI) {
		let sql = `UPDATE korisnik SET ime=?, prezime=?, lozinka=?, email=? WHERE korime=?`;
        let podaci = [korisnik.ime,korisnik.prezime,
                      korisnik.lozinka,korisnik.email,korime];
		this.baza.ubaciAzurirajPodatke(sql,podaci);
		return true;
	}

async dodajZahtjevServisa(korime: string) {
    let sql = "INSERT INTO zahtjev_servisa (korime) VALUES (?)";
    await this.baza.ubaciAzurirajPodatke(sql, [korime]);
    return true;
}

async dohvatiStatusZahtjeva(korime: string) {
    let sql = "SELECT status FROM zahtjev_servisa WHERE korime = ? ORDER BY datum_zahtjeva DESC LIMIT 1";
    let rezultat = await this.baza.dajPodatkePromise(sql, [korime]) as any[];
    return rezultat[0]?.status || null;
}


async dohvatiSveZahtjeve() {
    let sql = "SELECT * FROM zahtjev_servisa WHERE status = 'pending' ORDER BY datum_zahtjeva DESC";
    return await this.baza.dajPodatkePromise(sql, []) as any[];
}

async azurirajStatusZahtjeva(korime: string, akcija: string) {
    let sql = "UPDATE zahtjev_servisa SET status = ? WHERE korime = ? AND status = 'pending'";
    let status = akcija === 'odobri' ? 'approved' : 'rejected';
    await this.baza.ubaciAzurirajPodatke(sql, [status, korime]);
    return true;
}

}