import express from "express";
import cors from "cors";
import { dajPortSevis } from "../zajednicko/esmPomocnik.js";
import { Konfiguracija } from "../zajednicko/konfiguracija.js";
import { RestKorisnik } from "./restKorisnik.js";
import { RestTMDB } from "./restTMDB.js";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { Request, Response } from "express";

const server = express();
let konf = new Konfiguracija();
konf
    .ucitajKonfiguraciju()
    .then(pokreniServer)
    .catch((greska: Error | any) => {
        if (process.argv.length == 2)
            console.error("Potrebno je dati naziv datoteke");
        else if (greska.path != undefined)
            console.error("Nije moguće otvoriti datoteku: " + greska.path);
        else console.log(greska.message);
        process.exit();
    });

let port = dajPortSevis("dhegedusi21");
if (process.argv[3] != undefined) {
    port = process.argv[3];
}

server.use(express.urlencoded({ extended: true }));
server.use(express.json());
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

server.use("/css", express.static(__dirname + "/css"));
server.use("/js", express.static(__dirname + "/jsk"));

server.use(
    cors({
        origin: function (origin, povratniPoziv) {
            if (
                !origin ||
                origin.startsWith("http://spider.foi.hr:") ||
                origin.startsWith("http://localhost:")
            ) {
                povratniPoziv(null, true);
            } else {
                povratniPoziv(new Error("Nije dozvoljeno zbog CORS"));
            }
        },
        optionsSuccessStatus: 200,
        credentials: true,
        allowedHeaders: ['Content-Type', 'Authorization']
    })
);


function pokreniServer() {
    pripremiPutanjeResursKorisnika();
    pripremiPutanjeResursTMDB();

    server.use((zahtjev, odgovor) => {
        odgovor.status(404);
        var poruka = { greska: "nepostojeći resurs" };
        odgovor.send(JSON.stringify(poruka));
    });

    server.listen(port, () => {
        console.log(`Server pokrenut na portu: ${port}`);
    });
}

function pripremiPutanjeResursTMDB() {
    let restTMDB = new RestTMDB(
        konf.dajKonf()["tmdbApiKeyV3"],
        konf.dajKonf()["jwtTajniKljuc"]
    );

    server.post("/api/tmdb/osobeJWT", restTMDB.getOsobeJWT.bind(restTMDB));
    server.get("/api/tmdb/osobe", restTMDB.getOsobe.bind(restTMDB));
    server.post("/api/tmdb/dodajOsobu", (zahtjev: Request, odgovor: Response) => {
        restTMDB.spremiOsobu(zahtjev.body)
            .then(rezultat => odgovor.json(rezultat))
            .catch(greska => odgovor.status(500).json({ status: 'error', message: greska.message }));
    });
    server.get("/api/tmdb/osobaDetalji/:id", restTMDB.getOsobaDetalji.bind(restTMDB));
    server.get("/api/tmdb/osobaGalerija/:id", restTMDB.getOsobaGalerija.bind(restTMDB));
    server.post("/api/tmdb/osobaDetalji/:id", restTMDB.getOsobaDetalji.bind(restTMDB));
    server.post("/api/tmdb/osobaGalerija/:id", restTMDB.getOsobaGalerija.bind(restTMDB));
	server.post("/api/tmdb/osobaFilmovi/:id", restTMDB.getOsobaFilmovi.bind(restTMDB));
    server.get("/api/tmdb/lokalneOsobe", restTMDB.getLokalneOsobe.bind(restTMDB));
    server.get("/api/tmdb/lokalnaOsoba/:id", restTMDB.getLokalnaOsoba.bind(restTMDB));

}

function pripremiPutanjeResursKorisnika() {
    let restKorisnik = new RestKorisnik();
    server.post("/api/korisnici/zahtjevServisa", restKorisnik.zahtjevServisa.bind(restKorisnik));
    server.get("/api/korisnici/zahtjevi", restKorisnik.dohvatiZahtjeve.bind(restKorisnik));
    server.post("/api/korisnici/obradiZahtjev", restKorisnik.obradiZahtjev.bind(restKorisnik));
    server.get("/api/korisnici", restKorisnik.getKorisnici.bind(restKorisnik));
    server.post("/api/korisnici", restKorisnik.postKorisnici.bind(restKorisnik));
    server.post("/api/korisnici/trenutni", restKorisnik.getCurrentUser.bind(restKorisnik));
    server.put("/api/korisnici", restKorisnik.putKorisnici.bind(restKorisnik));
    server.delete("/api/korisnici", restKorisnik.deleteKorisnici.bind(restKorisnik));
    server.get("/api/korisnici/:korime", restKorisnik.getKorisnik.bind(restKorisnik));
    server.post("/api/korisnici/:korime/prijava", restKorisnik.getKorisnikPrijava.bind(restKorisnik));
    server.post("/api/korisnici/:korime", restKorisnik.postKorisnik.bind(restKorisnik));
    server.put("/api/korisnici/:korime", restKorisnik.putKorisnik.bind(restKorisnik));
    server.delete("/api/korisnici/:korime", restKorisnik.deleteKorisnik.bind(restKorisnik));
}
