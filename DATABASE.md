## Base de données (Google Sheets)

Les données sont stockées dans un Google Sheet, un onglet par table.
La ligne 1 de chaque onglet contient les noms des colonnes.

### `user` — les étudiants
| Colonne | Description |
|---|---|
| `id` | Identifiant Discord de l'utilisateur (clé primaire) |
| `nickname` | Pseudo affiché sur le site |
| `id_role` | Rôle de l'utilisateur → `role.id` |

### `role` — les rôles
| Colonne | Description |
|---|---|
| `id` | Identifiant du rôle |
| `name` | `administrator` (1) ou `student` (2) |

### `technologie` — le référentiel des technologies
| Colonne | Description |
|---|---|
| `id` | Identifiant de la technologie |
| `name` | Nom de la technologie (ex. `JavaScript`) |

Géré par l'administrateur (ajout, renommage, fusion des doublons).

### `skill` — les compétences des étudiants
| Colonne | Description |
|---|---|
| `id` | Identifiant de la compétence |
| `id_user` | Étudiant concerné → `user.id` |
| `id_technologie` | Technologie concernée → `technologie.id` |
| `level` | Niveau de maîtrise, de 1 à 5 |
| `date_update` | Date de dernière modification (format ISO) |

Un étudiant a **un seul niveau par technologie** : la paire
(`id_user`, `id_technologie`) est unique. Le code doit mettre à jour
la ligne existante au lieu d'en créer une nouvelle.

### `session` — les sessions de connexion
| Colonne | Description |
|---|---|
| `token` | Token de session (clé primaire) |
| `date_expire` | Date d'expiration (format ISO) |
| `id_user` | Utilisateur connecté → `user.id` |

Un token expiré est refusé par le site et par le bot.
La déconnexion par un admin supprime le token de l'utilisateur.

### Règles générales
- Le Google Sheet ne vérifie rien (types, doublons, clés étrangères) :
  tous les contrôles se font dans `server/src/services/`.
- Les dates sont toujours au format ISO : `2026-11-05T16:18:00Z`.
- Seule la couche `server/src/data/` accède au Google Sheet.