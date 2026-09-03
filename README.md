# Fermax KG Website

Statische Website fuer **Fermax KG** unter der geplanten Domain `fermaxdach.com`.

## Lokal starten

```bash
npm install
npm run dev
```

Die lokale Vorschau laeuft standardmaessig ueber Vite und zeigt die URL im Terminal, typischerweise `http://127.0.0.1:5173/`.

## Build

```bash
npm run build
```

Der Build erzeugt den Ordner `dist/`. Vor jedem Start und Build werden aus den Originaldateien in `pics/` optimierte WebP- und AVIF-Versionen in `public/imgs/` erzeugt.

## Qualitaetspruefung

```bash
npm run qa
npm run check
```

`npm run qa` prueft die lokale Vorschau mit Playwright in mehreren Mobile-, Tablet- und Desktop-Breiten. `npm run check` fuehrt Build und QA gemeinsam aus. Fuer lokale Lighthouse-Messungen kann der Produktions-Build mit `npm run preview` gestartet werden.

## Firmendaten bearbeiten

Die sichtbaren Firmendaten stehen aktuell direkt in:

- `index.html`
- `impressum/index.html`
- `datenschutz/index.html`

Bei spaeterer Erweiterung kann daraus eine kleine gemeinsame Datenquelle gemacht werden. Der aktuelle Stand ist bewusst statisch und ohne CMS gehalten.

## Bilder austauschen

Die Originalbilder liegen in `pics/` und bleiben unveraendert erhalten. Bei einem Austausch bitte dieselben Dateinamen verwenden oder die Zuordnung in `scripts/optimize-images.mjs` anpassen. Danach:

```bash
npm run optimize:images
```

## Deployment

Die Website ist als statischer Vite-Build vorbereitet und kann auf ueblichen Static-Hosting-Plattformen aus `dist/` veroeffentlicht werden. Es gibt derzeit keine plattformspezifische Deployment-Konfiguration im Repository. Das GitHub-Repository ist `jonas201422/fermax`.

Produktive Veroeffentlichung auf `fermaxdach.com` und DNS-Aenderungen erfolgen erst nach Freigabe der Vorschau.

## Offene Punkte vor Veroeffentlichung

- Bildherkunft und Freigabe der verwendeten Motive final bestaetigen.
- Firmenbuchgericht, Gewerbeberechtigung/GISA, zustaendige Behoerde, Kammerzugehoerigkeit und anwendbare gewerbe- oder berufsrechtliche Vorschriften fuer das Impressum final bestaetigen und ergaenzen.
- Tatsaechlichen Hosting-Anbieter, Serverlog-Speicherdauer und Auftragsverarbeitungsvertrag in der Datenschutzerklaerung ergaenzen.
- Rechtstexte vor Produktivschaltung rechtlich pruefen lassen.
