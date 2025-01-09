
export class TMDBklijent {
    private bazicniURL = "https://api.themoviedb.org/3";
    private apiKljuc: string;

    constructor(apiKljuc: string) {
        this.apiKljuc = apiKljuc;
    }

    private async obaviZahtjev(resurs: string, parametri: { [kljuc: string]: string | number | boolean } = {}) {
        let zahtjev = this.bazicniURL + resurs + "?api_key=" + this.apiKljuc;
        for (let p in parametri) {
            zahtjev += "&" + p + "=" + parametri[p];
        }
        console.log(zahtjev);
        let odgovor = await fetch(zahtjev);
        let rezultat = await odgovor.text();
        return rezultat;
    }

    public async dohvatiOsobu(id: number) {
        let resurs = "/person/" + id;
        let odgovor = await this.obaviZahtjev(resurs);
        return JSON.parse(odgovor);
    }

    public async dohvatiSlikeOsobe(id: number) {
        let resurs = `/person/${id}/images`;
        let odgovor = await this.obaviZahtjev(resurs);
        return JSON.parse(odgovor);
    }

    public async pretraziOsobePoImenu(trazi: string, stranica: number, brojPoStranici: number = 10) {
        let resurs = "/search/person";
        let parametri = {
            sort_by: "popularity.desc",
            include_adult: false,
            page: stranica,
            query: trazi,
            per_page: brojPoStranici
        };
        
        let odgovor = await this.obaviZahtjev(resurs, parametri);
        return JSON.parse(odgovor);
    }

    async dohvatiFilmoveOsobe(id: number, stranica: number = 1) {
        let resurs = `/person/${id}/movie_credits`;
        let odgovor = await this.obaviZahtjev(resurs);
        return JSON.parse(odgovor);
    }
}
