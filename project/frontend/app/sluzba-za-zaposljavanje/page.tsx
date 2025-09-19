"use client";
import GoBack from "@/components/go-back";
import LinkButton from "@/components/link-button";
import Wrap from "@/components/wrap";

/* 
1️⃣ Landing stranica Služba za zapošljavanje
Stranica /sluzba-za-zaposljavanje

Sadrži dugmad (LinkButton) za svaku glavnu funkcionalnost:
Kandidati
Poslovi
Intervjui
Ocjene kandidata
Statistika i izvještaji
Pozicije / Oglasi
Obavijesti kandidatima

2️⃣ Stranice i funkcionalnosti
a) Kandidati

Stranica /sluzba-za-zaposljavanje/kandidati
Lista kandidata (tabela/grid)
Dugmad: Dodaj, Edit, Delete
Modal/forma za dodavanje/edit kandidata
Filteri po statusu, poziciji, datumu prijave
Paginacija

b) Poslovi

Stranica /sluzba-za-zaposljavanje/poslovi
Lista poslova / oglasa
Dugmad: Dodaj, Edit, Delete
Prikaz otvorenih pozicija
Filteri po kategoriji ili statusu

c) Intervjui

Stranica /sluzba-za-zaposljavanje/intervjui
Lista zakazanih intervjua
Dugmad: Dodaj, Edit, Delete
Praćenje statusa (planiran, obavljen, otkazan)

d) Ocjene kandidata

Stranica /sluzba-za-zaposljavanje/ocjene-kandidata
Lista kandidata sa rezultatima testova/intervjua
Dugmad: Dodaj, Edit, Delete ocjene
Filteri po poziciji ili testu

e) Statistika i izvještaji

Stranica /sluzba-za-zaposljavanje/statistika
Dashboard sa brojem kandidata, otvorenih pozicija
Grafovi uspješnosti zapošljavanja
Filteri po periodu ili kategoriji

f) Pozicije / Oglasi

Stranica /sluzba-za-zaposljavanje/pozicije
Lista pozicija/oglasa
Dugmad: Dodaj, Edit, Delete
Filteri po statusu (otvoreno, zatvoreno)

g) Obavijesti kandidatima

Stranica /sluzba-za-zaposljavanje/obavijesti
Slanje email/SMS obavijesti kandidatima
Lista poslanih obavijesti
Dugmad: Dodaj novu obavijest, Edit, Delete

*/
export default function SluzbaZaZaposljavanje() {
  return (
    <Wrap>
      <h1 className="text-4xl font-bold">
        Sistem za zapošljavanje - odaberite opciju
      </h1>
      <div className="flex flex-col gap-y-4 mt-8">
        <LinkButton href="/sluzba-za-zaposljavanje/kandidati">
          Kandidati
        </LinkButton>
        <LinkButton href="/sluzba-za-zaposljavanje/poslovi">Poslovi</LinkButton>
        <LinkButton href="/sluzba-za-zaposljavanje/intervjui">
          Intervjui
        </LinkButton>
        {/* <LinkButton href="/sluzba-za-zaposljavanje/ocjene-kandidata">
          Ocjene kandidata
        </LinkButton> */}
        {/* <LinkButton href="/sluzba-za-zaposljavanje/statistika">
          Statistika i izvještaji
        </LinkButton> */}
        <LinkButton href="/sluzba-za-zaposljavanje/prijave-za-posao">
          Prijave za posao
        </LinkButton>
        <LinkButton href="/sluzba-za-zaposljavanje/zaposleni-profesori-sa-faksa">
          Zaposleni profesori sa faksa
        </LinkButton>
        <LinkButton href="/sluzba-za-zaposljavanje/poslodavci">
          Poslodavci
        </LinkButton>
      </div>
    </Wrap>
  );
}
