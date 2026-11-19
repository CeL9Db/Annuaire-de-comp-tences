## Base de données (Google Sheets)

Les données sont stockées dans un Google Sheet, un onglet par table.
La ligne 1 de chaque onglet contient les noms des colonnes.

### `user` — les étudiants

| Colonne    | Type   | Description                                         |
| ---------- | ------ | --------------------------------------------------- |
| `id`       | texte  | Identifiant Discord de l'utilisateur (clé primaire) |
| `nickname` | texte  | Pseudo affiché sur le site                          |
| `id_role`  | nombre | Rôle de l'utilisateur → `role.id`                   |

### `role` — les rôles

| Position | En-tête dans Sheets | Propriété dans le code | Type   | Description                          |
| -------- | ------------------- | ---------------------- | ------ | ------------------------------------ |
| A        | `id`                | `id`                   | nombre | Identifiant du rôle : 1 ou 2         |
| B        | `id`                | `name`                 | texte  | `administrator` (1) ou `student` (2) |

La feuille existante possède deux en-têtes `id`. Le lecteur interprète
explicitement A comme l'identifiant et B comme le nom, sans modifier Sheets.
Il accepte également les en-têtes distincts `id`, `name`.

### `technologie` — le référentiel des technologies

| Colonne | Type   | Description                              |
| ------- | ------ | ---------------------------------------- |
| `id`    | nombre | Identifiant de la technologie            |
| `name`  | texte  | Nom de la technologie (ex. `JavaScript`) |

Géré par l'administrateur (ajout, renommage, fusion des doublons).

### `skill` — les compétences des étudiants

| Colonne          | Type       | Description                                         |
| ---------------- | ---------- | --------------------------------------------------- |
| `id`             | nombre     | Identifiant de la compétence                        |
| `level`          | nombre     | Niveau de maîtrise, de 1 à 5                        |
| `date_update`    | date-heure | Date de la dernière modif (voir « Dates » plus bas) |
| `id_user`        | texte      | Étudiant concerné → `user.id`                       |
| `id_technologie` | nombre     | Technologie concernée → `technologie.id`            |

Ordre actuel dans Sheets : `id`, `level`, `date_update`, `id_user`, `id_technologie`.

Un étudiant a **un seul niveau par technologie** : la paire
(`id_user`, `id_technologie`) est unique. Le code doit mettre à jour
la ligne existante au lieu d'en créer une nouvelle.

### `session` — les sessions de connexion

| Colonne       | Type       | Description                                 |
| ------------- | ---------- | ------------------------------------------- |
| `token`       | texte      | Token de session (clé primaire)             |
| `date_expire` | date-heure | Date d'expiration (voir « Dates » plus bas) |
| `id_user`     | texte      | Utilisateur connecté → `user.id`            |

Un token expiré est refusé par le site et par le bot.
La déconnexion par un admin supprime le token de l'utilisateur.

### Règles générales

- Chaque onglet est maintenant un tableau Sheets, donc chaque colonne a un
  type (texte, nombre ou date-heure). Par contre Sheets ne vérifie toujours
  pas les doublons ni les clés étrangères, c'est à nous de le faire dans
  `server/src/services/`.
- Les colonnes de dates sont en date-heure dans Sheets (on les voit comme
  `10/11/2026 14:30:00`), fuseau `Europe/Paris`. Côté code, l'API nous les
  donne quand même en nombre de série (voir plus bas).
- Seule la couche `server/src/data/` accède au Google Sheet.

### Lecture et contrôle des données

- `server/src/data/dataSheets.ts` exporte `readTable(nom)` : une promesse
  contenant un tableau d'objets, avec les noms de colonnes comme propriétés.
- `server/src/services/sheetSchema.js` vérifie la structure, les champs,
  les clés primaires et les relations. Les colonnes peuvent être réordonnées,
  mais leur nom doit correspondre à ce document (exception : les deux `id` de `role`, interprétés par position). Les lignes
  entièrement vides sont ignorées ; une feuille vide doit conserver ses en-têtes.
- Attention aux types des identifiants : les ID Discord (`user.id`,
  `skill.id_user`, `session.id_user`) et `session.token` sont du texte.
  Tous les autres ID (`role.id`, `user.id_role`, `technologie.id`,
  `skill.id`, `skill.id_technologie`) sont des nombres, comme `skill.level`.
  Donc on compare `skill.id_technologie === technologie.id` sans conversion.
- Dans Sheets, stocker les IDs Discord au format **Texte brut** avant de les
  saisir : un grand identifiant stocké comme nombre peut déjà être arrondi.
- `date_update` et `date_expire` sont renvoyées comme des nombres. Les dates
  déjà numériques sont conservées. Les chaînes ISO UTC sont converties en nombres.

### Dates : chaîne vers nombre

Google Sheets compte les jours depuis le **30 décembre 1899** ; la partie
fractionnaire représente l'heure. Il ne s'agit pas d'un timestamp Unix.
La table actuelle utilise le fuseau **Europe/Paris**.

`server/src/services/sheetDates.js` exporte `dateStringToNumber` :

```js
import { dateStringToNumber } from "./services/sheetDates.js"

const date_update = dateStringToNumber("2026-11-05T16:18:00Z")
// 46331.72083333333 : 5 novembre 2026 à 17:18 à Paris
```

Entrée : chaîne ISO UTC terminée par `Z`, avec secondes et éventuellement
millisecondes. Les dates locales ambiguës comme `05/11/2026` sont refusées.
La conversion tient compte de l'heure d'été/hiver de Paris et ne dépend pas
du fuseau du serveur. Le fuseau peut être passé en second argument ; si celui
de la table change, mettre aussi à jour `SHEET_TIME_ZONE`.

`readTable` demande `UNFORMATTED_VALUE` et `SERIAL_NUMBER` à l'API.
Les cellules peuvent rester affichées au format date dans Sheets : le code
reçoit leur valeur numérique. Aucune cellule n'est modifiée à la lecture.

Pour le contrôle d'expiration, la date courante est convertie dans le même
format numérique avant comparaison. Ces nombres représentent une heure locale :
ils ne distinguent pas les deux occurrences d'une heure lors du passage à
l'heure d'hiver. Le contrôle est un diagnostic ; la connexion actuelle garde
ses dates ISO dans `server/store.ts` et n'est pas encore reliée à Sheets.

Configuration locale dans `.env` (ne pas publier la clé) :

```dotenv
GOOGLE_KEY_FILE=google-key.json
GOOGLE_SPREADSHEET_ID=identifiant_de_la_table
```

Le chemin relatif de la clé est résolu depuis la racine du projet. Utiliser
un fichier JSON de compte de service et partager la table avec son
`client_email` en lecture. Activer Google Sheets API dans le projet Google.
Le Spreadsheet ID est la partie entre `/d/` et `/edit` dans le lien Sheets.
Le lecteur utilise uniquement le scope `spreadsheets.readonly`.

Après installation des dépendances (`npm install`) :

- `npm run test:data` : tests locaux, sans réseau ni clé Google.
- `npm run test:sheets` : lecture des cinq tables et contrôle de leur intégrité.
  Affiche les nombres de lignes et les erreurs avec leur emplacement, sans
  afficher les utilisateurs ou les tokens. Code de sortie 1 en cas d'erreur.
  Les sessions expirées sont des avertissements, pas des erreurs de structure.

Le contrôle ne modifie aucune cellule. Il ne remplace pas les vérifications
à effectuer lors des écritures ni les contrôles d'authentification.
L'authentification du site utilise encore `server/store.ts` en mémoire.

Référence API : https://developers.google.com/workspace/sheets/api/reference/rest/v4/spreadsheets.values/get

Format des dates : https://developers.google.com/workspace/sheets/api/reference/rest/v4/DateTimeRenderOption
