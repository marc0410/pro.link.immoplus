# Marketing Pro — Acquisition

Module d'acquisition des professionnels de l'immobilier souhaitant rejoindre la plateforme ImmoPlus.

---

## Architecture

```
src/
├── core/
│   └── domain/
│       └── marketing-pro-acquisition/
│           ├── marketing-pro-acquisition-profil.enum.ts   # Enum Entreprise | Particulier
│           ├── marketing-pro-acquisition.model.ts         # Modèle domaine
│           ├── i-marketing-pro-acquisition.repository.ts  # Interface repository
│           └── index.ts
└── infrastructure/
    └── features/
        └── marketing-pro/
            ├── marketing-pro-acquisition.controller.ts
            ├── marketing-pro-acquisition.entity.ts        # Entité TypeORM
            ├── marketing-pro-acquisition.repository.ts
            ├── marketing-pro-acquisition.module.ts        # MarketingProModule
            ├── marketing-pro-acquisition-entity.mapper.ts
            └── dto/
                ├── create-marketing-pro-acquisition.dto.ts
                ├── marketing-pro-acquisition.dto.ts
                ├── marketing-pro-acquisition-dto.mapper.ts
                └── index.ts
```

**Enregistrement du module :** `MarketingProModule` est importé dans `rest.module.ts`.  
**Token IoC :** `Deps.MarketingProAcquisitionRepository` déclaré dans `src/core/domain/common/ioc/deps.ts`.

---

## Enum `MarketingProAcquisitionProfil`

```ts
enum MarketingProAcquisitionProfil {
  Entreprise  = "entreprise",
  Particulier = "particulier",
}
```

Le profil conditionne la validation du champ `entreprise` (obligatoire uniquement si `profil === "entreprise"`).

---

## Endpoints

### POST `/marketing-pro/acquisitions`

Soumet une demande d'acquisition marketing pro.

**Accès :** public, aucune authentification requise.

#### Corps de la requête

```json
{
  "nom": "Kouassi",
  "prenom": "Marc",
  "activite": "Agent immobilier",
  "email": "marc@immoci.com",
  "telephone": {
    "indicatif": "+225",
    "numero": "0707070707"
  },
  "profil": "entreprise",
  "entreprise": "Immo CI SARL",
  "appInstalle": true
}
```

| Champ               | Type      | Requis                                    | Règle de validation                         |
|---------------------|-----------|-------------------------------------------|---------------------------------------------|
| `nom`               | `string`  | Oui                                       | `@IsString`                                 |
| `prenom`            | `string`  | Oui                                       | `@IsString`                                 |
| `activite`          | `string`  | Oui                                       | `@IsString`                                 |
| `email`             | `string`  | Oui                                       | `@IsEmail`                                  |
| `telephone`         | `object`  | Oui                                       | `@ValidateNested`                           |
| `telephone.indicatif` | `string` | Oui                                      | `@IsString`                                 |
| `telephone.numero`  | `string`  | Oui                                       | `@IsString`                                 |
| `profil`            | `string`  | Oui                                       | `@IsEnum(MarketingProAcquisitionProfil)`    |
| `entreprise`        | `string`  | Oui si `profil === "entreprise"`          | `@ValidateIf` + `@IsNotEmpty`               |
| `appInstalle`       | `boolean` | Oui                                       | `@IsBoolean`                                |

#### Réponse `201 Created`

```json
{
  "success": true,
  "reference": "PRO-482031",
  "message": "Demande reçue. Vous serez contacté sous 48h."
}
```

| Champ       | Type      | Description                           |
|-------------|-----------|---------------------------------------|
| `success`   | `boolean` | Toujours `true` en cas de succès      |
| `reference` | `string`  | Référence unique générée (`PRO-XXXXXX`) |
| `message`   | `string`  | Message informatif pour l'utilisateur |

#### Réponse `422 Unprocessable Entity` — erreurs de validation

```json
{
  "success": false,
  "errors": {
    "email": "email must be an email",
    "profil": "profil must be one of the following values: entreprise, particulier",
    "entreprise": "entreprise should not be empty"
  }
}
```

#### Réponse `500 Internal Server Error`

```json
{
  "success": false,
  "message": "Une erreur est survenue, réessayez."
}
```

---

### GET `/marketing-pro/acquisitions`

Récupère la liste paginée des demandes d'acquisition.

**Accès :** protégé — rôle `Admin` requis + JWT Bearer token.

#### En-tête

```
Authorization: Bearer <token>
```

#### Paramètres de requête (`SearchItemsParamsDto`)

| Paramètre | Type     | Description                         |
|-----------|----------|-------------------------------------|
| `page`    | `number` | Numéro de page (défaut : 1)         |
| `limit`   | `number` | Nombre d'éléments par page          |
| `search`  | `string` | Recherche plein texte               |

Champs indexés pour la recherche : `id`, `reference`, `nom`, `prenom`, `entreprise`, `activite`, `email`, `telephoneNumero`, `profil`.

#### Réponse `200 OK`

```json
{
  "data": [
    {
      "id": "uuid",
      "reference": "PRO-482031",
      "nom": "Kouassi",
      "prenom": "Marc",
      "entreprise": "Immo CI SARL",
      "activite": "Agent immobilier",
      "email": "marc@immoci.com",
      "telephoneIndicatif": "+225",
      "telephoneNumero": "0707070707",
      "profil": "entreprise",
      "appInstalle": true,
      "createdAt": "2026-06-09T10:00:00.000Z",
      "updatedAt": "2026-06-09T10:00:00.000Z"
    }
  ],
  "meta": {
    "total": 42,
    "page": 1,
    "limit": 10
  }
}
```

---

## Table base de données — `marketing_pro_acquisitions`

| Colonne               | Type           | Contraintes                          |
|-----------------------|----------------|--------------------------------------|
| `id`                  | `uuid`         | PK, auto-généré                      |
| `reference`           | `varchar(20)`  | UNIQUE, NOT NULL                     |
| `nom`                 | `varchar(100)` | NOT NULL                             |
| `prenom`              | `varchar(100)` | NOT NULL                             |
| `entreprise`          | `varchar(255)` | NULLABLE                             |
| `activite`            | `varchar(255)` | NOT NULL                             |
| `email`               | `varchar(255)` | NOT NULL                             |
| `telephone_indicatif` | `varchar(10)`  | NOT NULL                             |
| `telephone_numero`    | `varchar(20)`  | NOT NULL                             |
| `profil`              | `varchar(20)`  | NOT NULL, default `"particulier"`    |
| `app_installe`        | `boolean`      | NOT NULL, default `false`            |
| `created_at`          | `timestamp`    | Auto                                 |
| `updated_at`          | `timestamp`    | Auto                                 |

---

## Logique métier

- La référence est générée aléatoirement au format `PRO-XXXXXX` (6 chiffres) côté serveur.
- Le champ `entreprise` n'est persisté en base que si `profil === "entreprise"` (spread conditionnel dans le controller).
- Le endpoint `POST` est volontairement public pour maximiser la conversion (formulaire de landing page).
- Le endpoint `GET` est réservé à l'administration pour consultation et traitement des demandes.
