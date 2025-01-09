export interface KorisnikI {
  ime:string;
  prezime:string;
  email:string;
  korime:string;
  lozinka:string | null;
  tip_korisnika_id: number;
  status_servisa: number;
}

