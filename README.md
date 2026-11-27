# Annuaire de compétences

Application web et bot Discord qui recensent les compétences techniques de la
promo : qui maîtrise quelle technologie, et à quel niveau (de 1 à 5).
Projet AAW, sujet 7, Master 1 Informatique, Université de Poitiers.

**Groupe :** ___ · **Trigramme :** `___`

| Membre | Partie principale |
| ------ | ----------------- |
| ___    | Serveur, connexion Discord |
| ___    | Données (Google Sheets) et site (React) |
| ___    | Bot Discord |

## Fonctionnalités

**Site web**

- Annuaire des étudiants, filtrable par technologie et par niveau minimal.
- Fiche d'un étudiant : ses compétences et la date de dernière mise à jour.
- Connexion avec Discord (OAuth2), sans mot de passe local.
- Page « Mes compétences » : ajouter, modifier et retirer ses propres compétences.

**Administration**

- Ajouter et renommer des technologies.
- Fusionner deux technologies en doublon.
- Modifier les compétences de n'importe quel étudiant.
- Déconnecter un utilisateur (son token de session est supprimé).
- Super-administrateur : nommer ou retirer des administrateurs.

**Bot Discord** : voir [Commandes du bot](#commandes-du-bot).

**Sécurité** : chaque connexion crée un token de session stocké dans la base,
avec une date d'expiration. Un token expiré est refusé par le site comme par le bot.

## Stack

| Partie | Technologies |
| ------ | ------------ |
| Client | React 19, React Router, TypeScript, Vite |
| Serveur | Node.js 26, Express 5, TypeScript (exécuté sans build) |
| Données | Google Sheets via l'API Google (compte de service) |
| Connexion | Discord OAuth2 |

## Structure du dépôt

```
client/            site React (Vite, port 5173)
  src/routes/      une page par fichier : Annuaire, FicheEtudiant, MesCompetences, Admin
  src/admin/       composants de la page d'administration
  src/components/  composants réutilisables (LevelMeter…)
server/            API Express (port 3000)
  src/routes/      routes : auth.ts, api.ts, admin.ts
  src/middleware/  vérification de la session et des rôles
  src/store/       lecture et écriture du Google Sheet
  test/            tests du serveur
shared/            code commun au client et au serveur
  apiPaths.ts      toutes les URL de l'API
  types.ts         types des données (User, Skill, Student…)
  constants.ts     identifiants des rôles
```

Le dossier `shared/` garantit que le client et le serveur utilisent les mêmes
URL et les mêmes types.

## Installation

Prérequis : **Node.js 26** (le serveur exécute le TypeScript directement).
Avec [fnm](https://github.com/Schniz/fnm) : `fnm install --use 26`.

```sh
npm install
cp .env.example .env     # puis le remplir, voir « Configuration »
npm run dev              # lance le serveur (3000) et le client (5173)
```

Ouvrir ensuite **http://localhost:5173**. Le port 3000 ne sert que l'API :
y ouvrir `/` affiche `Cannot GET /`, c'est normal.

| Commande | Rôle |
| -------- | ---- |
| `npm run dev` | serveur + client en mode développement |
| `npm test` | tests du serveur |
| `npm run test:sheets` | vérifie l'accès au Google Sheet (affiche les tables) |
|
