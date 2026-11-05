# Projet AAW – Sujet 7 : Annuaire de compétences

**Groupe :** ________ · **Trigramme :** ___ (préfixe de toutes vos commandes) · **Pile :** NodeJS + React · **Données :** un spreadsheet propre au groupe

## 1. Contexte

Pour former des équipes de projet, il faut savoir qui maîtrise quoi. Votre application recense les compétences techniques de la promo. Elle a deux points d'entrée : le site web et un bot Discord.

## 2. Ressource gérée

Chaque utilisateur gère **ses compétences** : technologie et niveau de maîtrise de 1 à 5.

## 3. Exigences

### 3.1 Site non connecté
- Page d'accueil avec menu et présentation du site.
- Lien de connexion et lien vers l'annuaire dans le menu.
- Annuaire des étudiants, filtrable par technologie et par niveau minimal.
- Fiche d'un étudiant : ses compétences et la date de dernière mise à jour.

### 3.2 Connexion
- Authentification via l'API Discord (OAuth2). Aucun mot de passe local.

### 3.3 Site connecté
- Un lien « Modifier » apparaît dans le menu.
- L'utilisateur ajoute, modifie et retire **uniquement ses propres compétences**.

### 3.4 Bot Discord
- Commande de consultation : les compétences d'un étudiant, ou les étudiants qui maîtrisent une technologie.
- Commande de mise à jour : définir son niveau dans une technologie.
- Toutes les commandes sont préfixées par votre trigramme (exemple : `/abc-skills`).
- Le bot est ajouté au serveur Discord de test du module.
- Le README liste toutes les commandes avec leurs paramètres.

### 3.5 Sécurité
- Un token de session stocké en base de données, avec une date d'expiration.
- Un token expiré est refusé par le site comme par le bot.

### 3.6 Administration
- Un rôle administrateur, géré dans vos données.
- L'administrateur modifie les compétences de n'importe quel étudiant.
- L'administrateur déconnecte un utilisateur (invalidation de son token).
- **Action propre au sujet :** gérer le référentiel des technologies et fusionner les doublons.

## 4. Éléments remis en cours

Le projet ne peut être ni démarré ni validé sans les éléments ci-dessous. Ils ne sont pas diffusés par écrit : venez les chercher en séance.

| Élément | Remis le |
| --- | --- |
| Spreadsheet de départ : structure des colonnes et référentiel initial | ________ |
| Identifiants du serveur Discord de test et de l'application bot | ________ |
| Règle métier du sujet : échelle des niveaux et règle de fusion des doublons | ________ |
| Scénarios de démonstration à jouer lors de la soutenance | ________ |

## 5. Jalons

| Jalon | Contenu attendu | Date |
| --- | --- | --- |
| J1 | Schéma de données et maquettes du site | ________ |
| J2 | Connexion Discord et annuaire | ________ |
| J3 | Bot Discord fonctionnel | ________ |
| J4 | Backoffice administrateur | ________ |
| Soutenance | Démonstration et questions individuelles | ________ |

## 6. Livrables et évaluation

- Dépôt Git avec un historique de commits régulier et lisible, auquel chaque membre contribue.
- README : installation, configuration, liste des commandes du bot.
- Soutenance individuelle : démonstration en direct, puis modification de code demandée en séance sur votre propre projet.
