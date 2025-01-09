import { KorisnikDAO } from "./korisnikDAO.js";
export class RestKorisnik {
    kdao;
    constructor() {
        this.kdao = new KorisnikDAO();
    }
    getKorisnici(zahtjev, odgovor) {
        odgovor.type("application/json");
        this.kdao.dajSve().then((korisnici) => {
            console.log(korisnici);
            odgovor.send(JSON.stringify(korisnici));
        });
    }
    postKorisnici(zahtjev, odgovor) {
        odgovor.type("application/json");
        let podaci = zahtjev.body;
        let poruka = this.kdao.dodaj(podaci);
        odgovor.send(JSON.stringify(poruka));
    }
    deleteKorisnici(zahtjev, odgovor) {
        odgovor.type("application/json");
        this.kdao.dajSve().then((korisnici) => {
            korisnici.forEach(korisnik => {
                this.kdao.obrisi(korisnik.korime);
            });
            odgovor.send(JSON.stringify({ ok: "Svi korisnici obrisani" }));
        });
    }
    putKorisnici(zahtjev, odgovor) {
        odgovor.type("application/json");
        const korisnici = zahtjev.body;
        if (!Array.isArray(korisnici)) {
            odgovor.status(400).json({ greska: "Neispravan format podataka" });
            return;
        }
        const validniKorisnici = korisnici.every(k => k.korime && k.ime && k.prezime && k.email);
        if (!validniKorisnici) {
            odgovor.status(400).json({ greska: "Neispravan format podataka" });
            return;
        }
        Promise.all(korisnici.map(k => this.kdao.azuriraj(k.korime, k)))
            .then(() => odgovor.json({ ok: "Korisnici uspješno ažurirani" }))
            .catch(err => odgovor.status(500).json({ greska: "Grešska" }));
    }
    getKorisnik(zahtjev, odgovor) {
        odgovor.type("application/json");
        let korime = zahtjev.params["korime"];
        if (korime == undefined) {
            odgovor.status(404).json({ greska: "Korisnik nije pronađen" });
            return;
        }
        this.kdao.daj(korime).then((korisnik) => {
            if (korisnik) {
                odgovor.json(korisnik);
            }
            else {
                odgovor.status(404).json({ greska: "Korisnik nije pronađen" });
            }
        });
    }
    getKorisnikPrijava(zahtjev, odgovor) {
        odgovor.type("application/json");
        let korime = zahtjev.params["korime"];
        let lozinka = zahtjev.body.lozinka;
        if (!korime || !lozinka) {
            odgovor.status(400).send(JSON.stringify({ greska: "Nedostaju podaci za prijavu" }));
            return;
        }
        this.kdao.daj(korime).then((korisnik) => {
            if (korisnik) {
                if (korisnik.lozinka === lozinka) {
                    const { lozinka, ...sigurniPodaci } = korisnik;
                    odgovor.send(JSON.stringify(sigurniPodaci));
                }
                else {
                    odgovor.status(401).send(JSON.stringify({ greska: "Neispravni podaci za prijavu" }));
                }
            }
            else {
                odgovor.status(401).send(JSON.stringify({ greska: "Korisnik ne postoji" }));
            }
        });
    }
    postKorisnik(zahtjev, odgovor) {
        odgovor.type("application/json");
        odgovor.status(405);
        let poruka = { greska: "metoda nije dopuštena" };
        odgovor.send(JSON.stringify(poruka));
    }
    deleteKorisnik(zahtjev, odgovor) {
        odgovor.type("application/json");
        if (zahtjev.params["korime"] != undefined) {
            this.kdao.obrisi(zahtjev.params["korime"]);
            let poruka = { ok: "obrisan" };
            odgovor.send(JSON.stringify(poruka));
            return;
        }
        odgovor.status(407);
        let poruka = { greska: "Nedostaje podatak" };
        odgovor.send(JSON.stringify(poruka));
    }
    putKorisnik(zahtjev, odgovor) {
        odgovor.type("application/json");
        let korime = zahtjev.params["korime"];
        if (korime == undefined) {
            odgovor.status(401);
            odgovor.send(JSON.stringify({ greska: "Krivi podaci!" }));
            return;
        }
        let podaci = zahtjev.body;
        let poruka = this.kdao.azuriraj(korime, podaci);
        odgovor.send(JSON.stringify(poruka));
    }
    async getCurrentUser(zahtjev, odgovor) {
        const korime = zahtjev.body.korime;
        const korisnik = await this.kdao.daj(korime);
        if (korisnik) {
            const status = await this.kdao.dohvatiStatusZahtjeva(korime);
            const korisnikSaStatusom = {
                ...korisnik,
                status_servisa: status === 'approved'
            };
            odgovor.json(korisnikSaStatusom);
        }
        else {
            odgovor.status(404).json({ greska: "Korisnik nije pronađen" });
        }
    }
    async zahtjevServisa(zahtjev, odgovor) {
        const korime = zahtjev.body.korime;
        const korisnik = await this.kdao.daj(korime);
        if (korisnik) {
            await this.kdao.dodajZahtjevServisa(korime);
            odgovor.json({ poruka: "Zahtjev za pristup poslan" });
        }
        else {
            odgovor.status(404).json({ greska: "Korisnik nije pronađen" });
        }
    }
    async dohvatiZahtjeve(zahtjev, odgovor) {
        const zahtjevi = await this.kdao.dohvatiSveZahtjeve();
        odgovor.json(zahtjevi);
    }
    async obradiZahtjev(zahtjev, odgovor) {
        const { korime, akcija } = zahtjev.body;
        await this.kdao.azurirajStatusZahtjeva(korime, akcija);
        odgovor.json({ poruka: "Zahtjev obrađen" });
    }
}
