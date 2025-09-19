import Wrap from "@/components/wrap";
import LinkButton from "@/components/link-button";

/* 
1️⃣ Studenti (student.handler + student.repository)

Lista studenata (sa paginacijom i filterima)
Dodavanje novog studenta
Edit/Update studenta
Brisanje studenta
Enrolment u kurseve / dodavanje kursa studentu
Praćenje statusa (aktivni, diplomirani, pauza)

2️⃣ Profesori (professor.handler + professor.repository)

Lista profesora
Dodavanje novog profesora
Edit/Update profesora
Brisanje profesora
Dodeljivanje kurseva profesoru
Praćenje opterećenja (koliko kurseva vodi)

3️⃣ Kursevi (course.repository)

Lista kurseva
Dodavanje novog kursa
Edit/Update kursa
Brisanje kursa
Prikaz rasporeda kurseva / semestri
Prikaz povezanih profesora i studenata

4️⃣ Ocjene (grade.repository)

Upis ocjena za studente
Edit/Update ocjena
Brisanje ocjena
Prikaz ocjena po studentu / kursu
Filtriranje po semestru ili akademskoj godini

5️⃣ GPA (gpa.handler)

Izračunavanje GPA po studentu
Prikaz GPA liste studenata
Praćenje napretka kroz semestre

6️⃣ Alumni (alumni.handler + alumni.repository)

Lista alumni
Dodavanje novog alumni
Edit/Update alumni podataka
Brisanje alumni
Praćenje karijere nakon diplomiranja

...............

1️⃣ Landing stranica Fakultet

Stranica /fakultet

Sadrži dugmad (LinkButton) za svaku glavnu funkcionalnost:

Studenti
Profesori
Kursevi
Ocjene
GPA
Alumni

2️⃣ Stranice za svaku funkcionalnost
a) Studenti

Stranica /fakultet/studenti
Lista studenata (tabela/grid)
Dugmad: Dodaj, Edit, Delete
Modal/forma za dodavanje ili edit studenta
Filteri i paginacija

b) Profesori

Stranica /fakultet/profesori
Lista profesora
Dugmad: Dodaj, Edit, Delete
Modal/forma za dodeljivanje kurseva profesoru
Filteri

c) Kursevi

Stranica /fakultet/kursovi
Lista kurseva
Dugmad: Dodaj, Edit, Delete
Prikaz povezanih profesora i studenata

d) Ocjene

Stranica /fakultet/ocjene
Lista ocjena po studentu i kursu
Dugmad: Upis, Edit, Delete ocjene
Filter po semestru / akademskoj godini

e) GPA

Stranica /fakultet/gpa
Lista studenata sa GPA
Prikaz kroz grafove ili tabelu
Mogućnost filtriranja po semestru

f) Alumni

Stranica /fakultet/alumni
Lista alumni
Dugmad: Dodaj, Edit, Delete
Praćenje karijere i kontakta
*/
export default function FakultetPage() {
  return (
      <Wrap>
        <h1 className="text-4xl font-bold">Fakultet - odaberite opciju</h1>
        <div className="flex flex-col gap-y-4 mt-8">
          <LinkButton href="/fakultet/studenti">Studenti</LinkButton>
          <LinkButton href="/fakultet/profesori">Profesori</LinkButton>
          <LinkButton href="/fakultet/kursevi">Kursevi</LinkButton>
          <LinkButton href="/fakultet/ispiti">Ispiti</LinkButton>
          {/* <LinkButton href="/fakultet/ocjene">Ocjene</LinkButton> */}
          {/* <LinkButton href="/fakultet/gpa">GPA</LinkButton>
          <LinkButton href="/fakultet/alumni">Alumni</LinkButton> */}
        </div>
      </Wrap>
  );
}
