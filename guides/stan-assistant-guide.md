# STAN assistant guide — Entity Manager Demo

This guide is a compact, self-contained reference for assistants (and humans) working in this repository. It explains the runtime model and the minimum working patterns to use or modify the demo correctly without relying on external TypeDoc pages or `.d.ts` browsing.

## What this repo is (scope)

- Package: `@karmaniverous/entity-manager-demo`
- Purpose: demonstrate a schema-first + values-first (inference-only) DX using:
  - `@karmaniverous/entity-manager` (key generation + query orchestration)
  - `@karmaniverous/entity-client-dynamodb` (DynamoDB adapter + QueryBuilder)
  - `@karmaniverous/entity-tools` (utility types + sorting + updates)
- Runtime target for tests: DynamoDB Local via Docker (tests manage lifecycle).

This is a demo repo, not a generic framework. Favor clarity + correctness over abstraction.

## Quick start (what to run)

Prereqs:

- Node 18+
- Docker Desktop (for DynamoDB Local)

Commands:

```bash
npm i
npm test
npm run typecheck
npm run lint
```

Notes:

- DynamoDB Local default port is `8000` (see `.env`).
- Tests start/stop the DynamoDB Local container automatically.

## Public entrypoints and key modules

### Root library entrypoint (`src/index.ts`)

This repo exports:

- `src/entity-manager/*` (Entity Manager config + EntityClient wiring + entity types)
- `src/handlers/*` (demo CRUD and search functions)

Typical consumer imports:

```ts
import { entityClient, createUser, searchUsers } from './src';
```

### Entity wiring (`src/entity-manager/*`)

- `src/entity-manager/entityManager.ts`
  - Defines `entityManagerConfig` as a literal (`as const`) and creates `entityManager`.
  - Configuration is the “source of truth” for:
    - entity tokens (`'user' | 'email'`)
    - generated property tokens (e.g., `beneficiaryHashKey`, `userHashKey`, `firstNameRangeKey`, `lastNameRangeKey`)
    - index tokens (see below)
- `src/entity-manager/entityClient.ts`
  - Creates the DynamoDB adapter `entityClient` and wires it to `entityManager`.
  - Uses DynamoDB Local endpoint `http://localhost:8000` (hard-coded).

### Handlers (`src/handlers/*`)

- User:
  - `createUser`, `readUser`, `updateUser`, `deleteUser`, `searchUsers`
- Email:
  - `createEmail`, `readEmail`, `deleteEmail`, `searchEmails`

Handlers intentionally return **domain items** (no generated/global keys) unless you explicitly request “keepKeys” in a read helper.

## Mental model: domain items vs stored records (keys)

There are two shapes to understand:

- **Domain item**: the “business object” returned by handlers and used in app code.
  - Example: `UserItem`, `EmailItem`
  - Does **not** include global keys (`hashKey`, `rangeKey`) or generated key tokens.
- **Stored record**: the DynamoDB representation with keys + generated properties.

The bridge is Entity Manager:

- `entityClient.entityManager.addKeys(entityToken, item)` → record (keys added)
- `entityClient.entityManager.removeKeys(entityToken, recordOrRecords)` → item(s) (keys removed)
- `entityClient.entityManager.getPrimaryKey(entityToken, itemOrItems)` → key object(s)

Rule of thumb:

- Before writing: build records with `addKeys`.
- After reading: return items via `removeKeys` (unless you need exact keys for deletes or low-level inspection).

## Entity tokens and index tokens used in this repo

### Entity tokens (ET)

- `user`
- `email`

### Index tokens (IT)

From `src/entity-manager/entityManager.ts`:

- Global (hashKey = global `hashKey`):
  - `created`, `firstName`, `lastName`, `phone`, `updated`
- Beneficiary-scoped (hashKey = `beneficiaryHashKey`):
  - `userBeneficiaryCreated`, `userBeneficiaryFirstName`, `userBeneficiaryLastName`, `userBeneficiaryPhone`, `userBeneficiaryUpdated`
- User-scoped email index (hashKey = `userHashKey`):
  - `userCreated`

These tokens matter because QueryBuilder calls must use the literal tokens (typed unions) to keep inference and paging correct.

## CRUD patterns (canonical)

### Create

Example: create a user (handler does the key work internally).

```ts
import { createUser } from './src/handlers';

const user = await createUser({
  beneficiaryId: 'BEN123',
  firstName: 'Ada',
  lastName: 'Lovelace',
});
```

Implementation notes (how it works):

- Handler normalizes names and stores canonical forms:
  - `firstNameCanonical = normstr(firstName) ?? ''`
  - `lastNameCanonical = normstr(lastName) ?? ''`
- Handler generates missing `userId` (`nanoid()`).
- Handler calls:
  - `entityClient.entityManager.addKeys('user', item)`
  - `entityClient.putItem(record)`

### Read (keepKeys overload)

Read helpers support “keepKeys” for DX:

```ts
import { readUser } from './src/handlers';

const items = await readUser('someUserId'); // Promise<UserItem[]>
const records = await readUser('someUserId', true); // Promise<UserRecord[]>
```

Use `keepKeys: true` when you need exact storage keys (e.g., to delete safely).

### Update

`updateUser` uses shallow-update semantics and returns an array for consistency with read/search:

```ts
import { updateUser } from './src/handlers';

const updated = await updateUser({ userId: 'u1', phone: '5551234' });
// updated: UserItem[]
```

Update conventions (via `updateRecord` / MakeUpdatable semantics):

- `undefined` → ignored (no change)
- `null` → delete the property (it will be removed in the final payload)

### Delete (read → derive keys → delete)

Delete handlers enforce existence and avoid partial-key deletes:

```ts
import { deleteUser } from './src/handlers';

await deleteUser('u1');
```

Internally:

- `readUser(userId, true)` to get records (with keys)
- `getPrimaryKey('user', records)` to derive exact keys
- `entityClient.deleteItems(keys)`

## Search patterns (QueryBuilder + enrich + sort + removeKeys)

Search handlers are meant to demonstrate:

- choosing hash key token based on scope (global vs beneficiary/user)
- composing index-aware range and filter conditions
- paging via `pageKeyMap`
- “enriching” results by re-fetching full items by primary key
- sorting on domain properties (not generated key strings)

### Search users (multi-index routing)

```ts
import { searchUsers } from './src/handlers';

const page1 = await searchUsers({ name: 'lov', sortOrder: 'name' });
const page2 = await searchUsers({
  name: 'lov',
  sortOrder: 'name',
  pageKeyMap: page1.pageKeyMap,
});
```

Key behavior:

- `name` and `phone` are normalized with `normstr` before searching.
- If `beneficiaryId` is present, the query uses `beneficiaryHashKey` (beneficiary-scoped indexes).
- If name search is active, the handler routes to `firstNameRangeKey` and/or `lastNameRangeKey` and uses `begins_with(...)`.
- After the query returns projected items, the handler:
  - derives primary keys via `getPrimaryKey`
  - calls `entityClient.getItems(keys)` to fetch full items
  - sorts on domain properties (e.g., `lastNameCanonical`, `created`, `updated`)
  - strips keys via `removeKeys` before returning

### Search emails (global vs per-user)

```ts
import { searchEmails } from './src/handlers';

// global email search by created range:
const global = await searchEmails({ createdFrom: Date.now() - 86400000 });

// per-user:
const perUser = await searchEmails({ userId: 'u1' });
```

Key behavior:

- If `userId` is present, search uses `userHashKey` and index token `userCreated`.
- Otherwise, it uses global `hashKey` and index token `created`.
- Like user search, it enriches and returns domain items (keys removed).

## DynamoDB Local + tests (how the suites work)

Tests use `@karmaniverous/dynamodb-local`:

- `setupDynamoDbLocal(port)`
- `dynamoDbLocalReady(entityClient.client)`
- `teardownDynamoDbLocal()`

And they create the table from the Entity Manager config:

```ts
import { generateTableDefinition } from '@karmaniverous/entity-client-dynamodb';

await entityClient.createTable({
  ...generateTableDefinition(entityClient.entityManager),
  BillingMode: 'PAY_PER_REQUEST',
});
```

## Common pitfalls (repo-specific)

- Email uniqueness is case-insensitive:
  - `createEmail` normalizes to `email.toLowerCase()`; always pass/read lowercased emails.
- Canonical name search:
  - search uses `firstNameCanonical` / `lastNameCanonical` computed via `normstr`.
  - if you change canonicalization, you must update both write paths and search paths.
- DynamoDB Local port configuration:
  - `.env` / `src/env.ts` expose `DYNAMODB_LOCAL_PORT`,
  - but `src/entity-manager/entityClient.ts` currently uses a hard-coded endpoint (`http://localhost:8000`).
  - If you change the port, update the endpoint accordingly (or refactor the client to use `env.dynamoDbLocalPort`).

## Change checklist (when editing this repo)

- If you add/change entity fields:
  - update the Zod schema (`src/entity-manager/User.ts` or `Email.ts`)
  - update `propertyTranscodes` in `entityManagerConfig` if the field participates in keys/indexes
  - update handlers that read/write/search those fields
  - update or add tests covering the new behavior
- If you add/change indexes:
  - update `entityManagerConfig.indexes`
  - update search handlers to route to the new literal index tokens
  - ensure result sorting remains on domain properties
  - ensure paging (`pageKeyMap`) is passed through unchanged between calls

That’s the minimum contract to keep this demo correct and inference-friendly.
