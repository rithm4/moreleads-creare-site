# Cum pui pagina nouă în Tilda

Pagina e formată din **16 blocuri T123** (cod HTML) și **un formular popup nativ Tilda**.
Cererile ajung în Tilda exact ca acum, deci notificările, CRM-ul și conversiile existente rămân valabile.

Previzualizare locală: rulează `node tools/build-preview.mjs`, apoi deschide `preview.html` în browser.
Acolo formularul e doar o simulare. În Tilda îl înlocuiește formularul nativ de la pasul 3.

---

## 1. Pagina

1. Creează o **pagină nouă** în proiect. Pe cea veche o păstrezi până testezi totul.
2. **Setări pagină → Fundal:** culoarea `#FFFFFF` (alb).
3. **Setări pagină → SEO:**
   - Titlu: `Creare site-uri în Chișinău, de la 349 € | MoreLeads`
   - Descriere: `Landing page-uri și site-uri de prezentare care aduc cereri. Schița și prețul fix le primești gratuit în 48 de ore. Gata în 7–14 zile, plata în două tranșe.`
4. **Nu adăuga un meniu Tilda.** Meniul e deja în blocul 01.

## 2. Blocurile T123

Pentru fiecare fișier din `tilda-blocuri/`, **în ordine, de la 00 la 15**:

1. Adaugă bloc → **Altele → T123 (cod HTML)**.
2. **Conținut** → lipește tot textul fișierului → Salvează.

| Ordine | Fișier | Ce face |
|---|---|---|
| 1 | `00-setari.html` | Font, culori, stiluri și scripturi comune. **Trebuie să fie primul.** Nu afișează nimic. |
| 2 | `01-header.html` | Meniul fix de sus (cu logo-ul vectorizat) + bara de contact de jos pe mobil |
| 3 | `02-hero.html` | Primul ecran: titlul și cardurile cu proiectul recent, prețul, oferta și cifrele |
| 4 | `03-clienti.html` | Logo-urile clienților, într-o bandă care se derulează |
| 5 | `04-rezultate.html` | Cifrele din proiectele clienților, cu graficul Dent Expert |
| 6 | `05-portofoliu.html` | Portofoliul în grilă bento (aici editezi proiectele, vezi pasul 4) |
| 7 | `06-de-ce.html` | De ce aduce cereri: metoda, în 4 carduri |
| 8 | `07-inclus.html` | Ce primești, la orice pachet |
| 9 | `08-proces.html` | Cum lucrăm: schița ca pasul 0, apoi 4 pași cu „Tu” și „Primești” |
| 10 | `09-pentru-cine.html` | Pentru cine e serviciul și ce nu facem |
| 11 | `10-preturi.html` | Pachetele, prețurile și ce mai costă |
| 12 | `11-garantii.html` | Garanțiile |
| 13 | `12-echipa.html` | Cine lucrează la site (aici pui numele și poza) |
| 14 | `13-recenzii.html` | Video-recenziile, cu firma și rezultatul |
| 15 | `14-intrebari.html` | Întrebări frecvente |
| 16 | `15-contact-footer.html` | Contactul final și footer-ul |

> În editorul Tilda blocurile T123 nu arată ca pe site. Verifică-le cu **Previzualizare** sau după publicare.

## 3. Formularul popup (nativ Tilda)

Toate butoanele „Cere oferta gratuită”, „Alege …” etc. deschid acest popup.

1. Adaugă blocul **BF502N** (Formular → formular pop-up). Poziția pe pagină nu contează.
2. **Conținut:**
   - **Link pentru popup:** `#popup:schita`, exact așa.
   - **Titlu:** `Schița și prețul fix în 48 de ore`
   - **Descriere:** `Lasă numărul. Te sunăm pentru o discuție de 20 de minute, apoi îți trimitem schița gratuită.`
   - **Câmpuri:**
     - Nume (opțional)
     - Telefon (**obligatoriu**, cu mască de telefon), cu textul de ajutor `+373 sau +40`
     - Listă derulantă (Select), **numele variabilei `Pachet`**, cu opțiunile de mai jos (copiază-le exact):
       ```
       Nu știu încă
       Landing Start, 349 €
       Landing + Google Ads, 590 €
       Site de prezentare, 790 €
       Altceva (magazin online, mai multe limbi)
       ```
       Butoanele din secțiunea de prețuri selectează automat pachetul potrivit. Dacă redenumești opțiunile, păstrează-le **începutul** („Landing Start”, „Landing + Google Ads”, „Site de prezentare”, „Altceva”), altfel preselectarea nu mai funcționează.
   - **Buton:** `Trimite cererea`
   - **Text sub buton:** `Folosim numărul doar ca să te sunăm despre această cerere.`
   - **Mesajele de eroare** (Setări formular → Mesaje), ca să nu apară cele implicite în engleză sau rusă:
     - câmp gol: `Scrie numărul de telefon.`
     - număr greșit: `Numărul pare incomplet. Verifică-l.`
   - **Mesaj după trimitere:** `Mulțumim! Am primit cererea. Te sunăm în aceeași zi lucrătoare, între 9:00 și 18:00, pentru discuția de 20 de minute.`
   - **Receptori de date:** aceiași ca la formularul de pe pagina veche.
3. **Setări bloc:** fundalul popup-ului `#FFFFFF`, butonul `#7A5AF0` cu text alb (hover `#6A4AE4`), marginea câmpurilor `#D4D4DC`. Colțurile (8 px) și fontul se aplică automat din blocul 00.

## 4. Portofoliul

În `05-portofoliu.html`, în `<script>`, completezi lista `ML_PROIECTE`. Un rând pentru fiecare proiect:

```js
{ nume: 'Nume client', domeniu: 'Clinică dentară', tip: 'Landing page',
  url: 'https://site-client.md', desktop: 'https://static.tildacdn.com/…/desktop.jpg',
  mobil: 'https://static.tildacdn.com/…/mobil.jpg' },
```

- `tip` creează filtrele de deasupra portofoliului. Folosește aceleași denumiri peste tot, de exemplu „Landing page” și „Site de prezentare”.
- Primul proiect din listă apare și în cardul mare din primul ecran, iar captura de mobil a celui de-al doilea apare în cardul „Viteză și mobil”. Pune primele proiectele cele mai frumoase.
- Grila alternează singură: un card mare, trei mici, unul lat, apoi din nou. La început se văd 5 proiecte, restul apar la butonul „Toate proiectele”.

**Capturile de ecran.** Cel mai bine arată capturile întregii pagini: se derulează singure când treci cu mouse-ul peste proiect. Le poți face automat:

```
node tools/screenshot.mjs https://site-client.md portofoliu/client-desktop.jpg --full --max-height=6000 --format=jpeg --quality=80
node tools/screenshot.mjs https://site-client.md portofoliu/client-mobil.jpg --mobile --full --max-height=7000 --format=jpeg --quality=80
```

**Cum obții linkul imaginii în Tilda:** pe o pagină ascunsă (nepublicată în meniu), pune un bloc de imagine, încarcă poza, publică, apoi click dreapta pe imagine → „Copiază adresa imaginii”. Linkul acela îl pui la `desktop` sau `mobil`.

## 5. Animațiile

Sunt toate în blocul 00 și pornesc singure. Nu trebuie activat nimic în Tilda.
- Titlurile apar cuvânt cu cuvânt, liniile se desenează, capturile din portofoliu se dezvelesc, cifrele din „Rezultate” numără de la 0.
- Pe desktop, peste proiecte apare eticheta „Vezi site-ul” care urmărește mouse-ul.
- Fiecare animație rulează o singură dată, când secțiunea ajunge pe ecran.
- Vizitatorii care au cerut în sistem „mai puțină mișcare” văd doar apariții scurte, fără deplasări.
- Dacă JavaScript-ul nu pornește din orice motiv, pagina se afișează normal, fără animații.

Nu seta în Tilda animații proprii („Animație” din setările blocului) pe blocurile T123, fiindcă s-ar suprapune.

## 6. Google Tag Manager și Google Ads

Pagina trimite aceste evenimente în `dataLayer` (GTM-ul tău, GTM-WWTFKQXB, le primește):

| Eveniment | Când |
|---|---|
| `ml_cta_click` | click pe orice buton care deschide formularul (`ml_loc` spune care buton) |
| `ml_whatsapp_click` | click pe WhatsApp |
| `ml_phone_click` | click pe numărul de telefon |
| `ml_video_play` | pornirea unei video-recenzii cu sunet |

În GTM: **Declanșator → Eveniment personalizat** cu numele de mai sus, apoi o etichetă de **conversie Google Ads** pentru `ml_whatsapp_click` și `ml_phone_click`. Conversia pe formular rămâne cea pe care o ai deja, fiindcă formularul e tot cel nativ Tilda.

## 7. Verificare înainte de lansare

- [ ] Fiecare buton „Cere oferta gratuită” / „Alege …” deschide popup-ul
- [ ] La „Alege Landing + Google Ads” pachetul e deja selectat în formular
- [ ] O cerere de test ajunge unde trebuie (email / CRM / Telegram)
- [ ] WhatsApp și telefonul se deschid corect de pe telefon
- [ ] Pe telefon, bara de jos apare după ce derulezi
- [ ] Video-recenziile pornesc cu sunet la click
- [ ] Proiectele din portofoliu deschid site-urile corecte (eticheta „Vezi site-ul”)
- [ ] Linkurile din footer (politica de confidențialitate, termeni) funcționează
