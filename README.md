# Punktly

Punktly ist eine deutschsprachige Familien-App als Startprojekt für GitHub, Vercel und Firebase.

## Idee

Kinder erledigen Aufgaben und bekommen dafür Coins und XP. Sie können einen von 23 Coins als Avatar auswählen, Level aufsteigen und durch Eltern angelegte Belohnungen einlösen.

## Bereiche

- `/` Startseite
- `/kinder` Kinderbereich mit Start, Aufgaben, Coin-Avataren und Belohnungen
- `/eltern` Elternbereich für Kinder, Aufgaben und Belohnungen

## Tech-Stack

- Next.js App Router
- React + TypeScript
- Tailwind CSS
- Firebase Auth / Firestore vorbereitet
- Vercel-ready

## Lokal starten

```bash
npm install
npm run dev
```

Dann öffnen:

```bash
http://localhost:3000
```

## Firebase einrichten

1. Firebase-Projekt erstellen
2. Web-App in Firebase hinzufügen
3. `.env.example` zu `.env.local` kopieren
4. Firebase-Werte eintragen

```bash
cp .env.example .env.local
```

## Empfohlene Firestore-Struktur

```txt
families/{familyId}
  name
  ownerId
  createdAt

families/{familyId}/children/{childId}
  name
  avatarCoinId
  coins
  xp
  level

families/{familyId}/tasks/{taskId}
  title
  description
  childId
  rewardCoins
  rewardXp
  status: offen | prüfung | erledigt
  createdBy
  createdAt

families/{familyId}/rewards/{rewardId}
  title
  description
  cost
  active

families/{familyId}/redemptions/{redemptionId}
  rewardId
  childId
  status: angefragt | bestätigt | abgelehnt
```

## Deployment auf Vercel

1. Projekt zu GitHub hochladen
2. In Vercel neues Projekt aus GitHub importieren
3. Environment Variables aus `.env.example` eintragen
4. Deploy klicken

## Nächste Ausbaustufen

- Login für Eltern
- PIN-Login für Kinder
- Aufgaben erstellen, bestätigen und ablehnen
- Coins/XP automatisch vergeben
- Belohnungen einlösen
- Familien-Einladungen
- echte Coin-Grafiken statt Emoji-Platzhalter
