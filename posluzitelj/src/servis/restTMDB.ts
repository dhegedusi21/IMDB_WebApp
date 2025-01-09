import * as jwt from "../zajednicko/jwt.js";
import { Request, Response } from "express";
import { TMDBklijent } from "./klijentTMDB.js";
import Baza from "../zajednicko/sqliteBaza.js";

export class RestTMDB {
    private tmdbKlijent: TMDBklijent;
    private tajniKljucJWT: string;
    private baza: Baza;

    constructor(api_kljuc: string, tajniKljucJWT: string) {
        this.tmdbKlijent = new TMDBklijent(api_kljuc);
        this.tajniKljucJWT = tajniKljucJWT;
        this.baza = new Baza("podaci/RWA2024dhegedusi21_servis.sqlite");
    }

    getOsobeJWT(zahtjev: Request, odgovor: Response) {
        if (!jwt.provjeriToken(zahtjev, this.tajniKljucJWT)) {
            odgovor.status(401);
            odgovor.json({ greska: "Neautorizirani pristup" });
        } else {
            this.getOsobe(zahtjev, odgovor);
        }
    }

    async getOsobe(zahtjev: Request, odgovor: Response) {
        odgovor.type("application/json");
        let stranica = zahtjev.query["stranica"];
        let trazi = zahtjev.query["trazi"];
        let brojPoStranici = (zahtjev.query["brojPoStranici"] as string) || "10";

        if (stranica == null || trazi == null || typeof stranica != "string" || typeof trazi != "string") {
            odgovor.status(417);
            odgovor.send({ greska: "Neočekivani podaci" });
            return;
        }

        let rezultat = await this.tmdbKlijent.pretraziOsobePoImenu(trazi, parseInt(stranica), parseInt(brojPoStranici));
        odgovor.json(rezultat);
    }
    async spremiOsobu(osoba: any) {
        const sqlOsoba = "INSERT INTO osoba (ime, prezime, spol, rodenjeDatum, popularnost, tmdbId) VALUES (?, ?, ?, ?, ?, ?) RETURNING idOsobe";
        const parametriOsoba = [
            osoba.ime, 
            osoba.prezime, 
            osoba.spol || null, 
            osoba.datumRodenja || null, 
            osoba.popularnost || 0,
            osoba.id
        ];
    
        const rezultat = await this.baza.dajPodatkePromise(sqlOsoba, parametriOsoba) as Array<{idOsobe: number}>;
        if (rezultat && rezultat.length > 0) {
            const osobaId = rezultat[0]?.idOsobe;
            const sqlSlika = "INSERT INTO slike (slikaPutanja, osoba_idOsobe) VALUES (?, ?)";
            await this.baza.ubaciAzurirajPodatke(sqlSlika, [osoba.slika, osobaId]);
        }
        return { status: 'success', message: "Osoba uspješno spremljena" };
    }
    
    
    
    

    async getOsobaDetalji(zahtjev: Request, odgovor: Response) {
        const id = zahtjev.params['id'];
        if (!id) {
            odgovor.status(400).json({ greska: "Nedostaje ID osobe" });
            return;
        }
        try {
            const osoba = await this.tmdbKlijent.dohvatiOsobu(parseInt(id));
            odgovor.json(osoba);
        } catch (error) {
            odgovor.status(400).json({ greska: "Greška u dohvatu detalja osobe" });
        }
    }

    async getOsobaGalerija(zahtjev: Request, odgovor: Response) {
        const id = zahtjev.params['id'];
        if (!id) {
            odgovor.status(400).json({ greska: "Nedostaje ID osobe" });
            return;
        }
        try {
            const galerija = await this.tmdbKlijent.dohvatiSlikeOsobe(parseInt(id));
            odgovor.json(galerija);
        } catch (error) {
            odgovor.status(400).json({ greska: "Greška u dohvatu galerije" });
        }
    }

    async getOsobaFilmovi(zahtjev: Request, odgovor: Response) {
        const osobaId = zahtjev.params['id'];
        if (!osobaId) {
            odgovor.status(400).json({ greska: "Nedostaje ID osobe" });
            return;
        }
        const stranica = zahtjev.query['stranica']?.toString() || '1';
        let filmovi = await this.tmdbKlijent.dohvatiFilmoveOsobe(parseInt(osobaId), parseInt(stranica));
        odgovor.json(filmovi);
    }
   
    
    async getLokalneOsobe(zahtjev: Request, odgovor: Response) {
        try {
            const searchTerm = zahtjev.query['trazi'] as string || '';
            const sql = `
                SELECT o.*, s.slikaPutanja, o.tmdbId
                FROM osoba o
                LEFT JOIN slike s ON o.idOsobe = s.osoba_idOsobe
                WHERE o.ime LIKE ? OR o.prezime LIKE ?
            `;
            const params = [`%${searchTerm}%`, `%${searchTerm}%`];
            const rezultat = await this.baza.dajPodatkePromise(sql, params);
            odgovor.json(rezultat);
        } catch (error) {
            odgovor.status(500).json({ greska: "Greška pri dohvatu osoba" });
        }
    }
    
    
    
    
    async getLokalnaOsoba(zahtjev: Request, odgovor: Response) {
        const id = zahtjev.params['id'];
        if (!id) {
            odgovor.status(400).json({ greska: "Nedostaje ID osobe" });
            return;
        }
        try {
            const sql = "SELECT * FROM osoba WHERE idOsobe = ?";
            const rezultat = await this.baza.dajPodatkePromise(sql, [id]) as Array<any>;
            if (rezultat.length > 0) {
                odgovor.json(rezultat[0]);
            } else {
                odgovor.status(404).json({ greska: "Osoba nije pronađena" });
            }
        } catch (error) {
            odgovor.status(500).json({ greska: "Greška pri dohvatu osobe" });
        }
    }
}
