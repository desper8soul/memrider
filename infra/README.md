# Infrastructure (Terraform)

Cognito is deployed for local as well.

## Layout

```
infra/
  bootstrap/           # Stage 0: S3 remote state bucket (once per AWS account)
  modules/cognito/     # Reusable Cognito module (resources)
  stacks/cognito/      # Deployable root module (provider + module call)
    env/
      dev.tfvars       # Per-environment values (gitignored)
      *.tfvars.example
    backend.tf         # backend "s3" {} — committed
    backend.hcl        # Bucket name, region — generated, gitignored
```


| Concept                        | Role                                                        |
| ------------------------------ | ----------------------------------------------------------- |
| **Module** (`modules/cognito`) | *What* to build — pool, domain, OAuth client                |
| **Stack** (`stacks/cognito`)   | *How* to deploy — AWS provider, tags, workspace, state      |
| **Bootstrap**                  | Remote state storage before other stacks can use S3 backend |


Environments (`dev`, `staging`, `prod`) are **Terraform workspaces** on the same stack, with separate `env/<env>.tfvars` files.

## AWS account model

All resources live in **one AWS account** (billing and isolation boundary — roughly like a GCP project).


| Who                   | Typical setup                                                    |
| --------------------- | ---------------------------------------------------------------- |
| **Solo / early team** | Shared project account; IAM users or SSO for each developer      |
| **Later**             | AWS Organizations + separate accounts per env (not required now) |


Infrastructure is tied to the **AWS account**. Other developers need IAM access to that account.

## Prerequisites

- [Terraform](https://developer.hashicorp.com/terraform/install) ≥ 1.5 (1.11+ uses S3 native state locking)
- [AWS CLI v2](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) (for `pnpm cognito:user` and credential export)
- AWS credentials with permission to create Cognito and S3

**AWS CLI login (WSL):**

```bash
aws login
aws sts get-caller-identity
```

Terraform does not read AWS CLI v2 `aws login` sessions directly. Our scripts run `aws configure export-credentials` before `terraform` commands.

## Remote state


| Stack         | State location                                                                     |
| ------------- | ---------------------------------------------------------------------------------- |
| **Bootstrap** | Local only: `infra/bootstrap/terraform.tfstate` (chicken-and-egg)                  |
| **Cognito**   | S3: `s3://memrider-tfstate-<account_id>/env/<workspace>/cognito/terraform.tfstate` |


Locking: S3 native lock files (`use_lockfile = true` in `backend.hcl`). Requires Terraform ≥ 1.11.

`backend.hcl` is written by `pnpm infra:bootstrap` (or regenerated when missing if bootstrap was already applied).

### Bootstrap on another machine

Bootstrap state is **only** on the machine that first ran `pnpm infra:bootstrap`. The S3 bucket **does** exist in AWS, but Terraform on a new laptop does not know that without local `infra/bootstrap/terraform.tfstate`.


| If you run…                                      | What happens                                                              |
| ------------------------------------------------ | ------------------------------------------------------------------------- |
| `pnpm infra:bootstrap` again (empty local state) | **Fails** — AWS returns bucket already exists (`BucketAlreadyOwnedByYou`) |
| `pnpm cognito:setup` with `backend.hcl` present  | **Works** — Cognito state is in S3, shared across machines                |
| `pnpm cognito:setup` without `backend.hcl`       | Script tries bootstrap outputs; fails if bootstrap state is missing       |


**Second machine — usual flow (do not re-bootstrap):**

1. Same AWS account credentials (`aws login`).
2. Create `infra/stacks/cognito/backend.hcl` — copy from a teammate, or from `backend.hcl.example` with your account ID:
  ```bash
   # bucket name: memrider-tfstate-$(aws sts get-caller-identity --query Account --output text)
   cp infra/stacks/cognito/backend.hcl.example infra/stacks/cognito/backend.hcl
   # edit bucket= line
  ```
3. `cp infra/stacks/cognito/env/dev.tfvars.example infra/stacks/cognito/env/dev.tfvars` (or copy teammate's tfvars).
4. `pnpm cognito:setup` or `pnpm cognito:sync-env` — reads/writes Cognito from **S3 remote state**.

**Only if you must manage bootstrap from a new machine** (rare): copy `infra/bootstrap/terraform.tfstate` securely from the first machine, or `terraform import` the existing S3 bucket into a fresh bootstrap state. Most teams never do this — bootstrap is one-person / one-time per account.

## Commands


| Command                                              | Description                                                             |
| ---------------------------------------------------- | ----------------------------------------------------------------------- |
| `pnpm infra:bootstrap`                               | Apply bootstrap stack; write `stacks/cognito/backend.hcl`               |
| `pnpm cognito:setup`                                 | `terraform apply` for workspace `dev`; sync Cognito vars to root `.env` |
| `pnpm cognito:sync-env`                              | Re-read Terraform outputs into `.env` (dev only)                        |
| `pnpm cognito:user <email> '<password>'`             | Create or reset a Cognito dev login (AWS CLI)                           |
| `bash scripts/terraform-cognito-apply.sh staging`    | Apply staging workspace                                                 |
| `bash scripts/terraform-cognito-sync-env.sh staging` | Print staging outputs (no `.env` write)                                 |


## First-time setup (account owner)

Run once per **AWS account**.

### 1. Bootstrap remote state

```bash
cp infra/bootstrap/terraform.tfvars.example infra/bootstrap/terraform.tfvars
# Edit aws_region if needed (default: eu-central-1)

pnpm infra:bootstrap
```

Creates:

- S3 bucket `memrider-tfstate-<account_id>` (versioning, encryption, public access blocked)
- `infra/stacks/cognito/backend.hcl` (with `use_lockfile = true`)

**Upgrading from an older bootstrap** that created `memrider-tf-locks`: run `pnpm infra:bootstrap` again.

### 2. Configure Cognito (dev)

```bash
cp infra/stacks/cognito/env/dev.tfvars.example infra/stacks/cognito/env/dev.tfvars
```

Edit `domain_prefix` — **globally unique** across Cognito Hosted UI (e.g. `memrider-dev-yourname`).


| Variable        | Dev example             |
| --------------- | ----------------------- |
| `environment`   | `dev`                   |
| `aws_region`    | `eu-central-1`          |
| `pool_name`     | `memrider-dev`          |
| `domain_prefix` | `memrider-dev-yourname` |
| `app_url`       | `http://localhost:3000` |


### 3. Provision Cognito + sync `.env`

```bash
pnpm cognito:setup
```

This selects workspace `dev`, runs `terraform apply`, and updates root `.env` with `COGNITO_*` and `NEXT_PUBLIC_COGNITO_*`.

If you have **old local state** under `stacks/cognito/terraform.tfstate.d/`, the script migrates it to S3 automatically (`-migrate-state -force-copy`).

### 4. Create a login user

```bash
pnpm cognito:user you@example.com 'YourDevPassword1!'
```

Requires AWS CLI and `cognito-idp:AdminCreateUser` / `AdminSetUserPassword` on the pool.

### 5. Run the app

```bash
docker compose up -d
pnpm db:deploy
pnpm dev
```

Open `http://localhost:3000/write` → redirect to Cognito Hosted UI → back with session cookie.

Hosted UI uses the Memrider logo and CSS from `infra/modules/cognito/assets/`. After changing branding, run `pnpm cognito:setup` (or `terraform apply` on the cognito stack) to publish.

## Local state cleanup

After bootstrap and `pnpm cognito:setup` have succeeded, remove leftover **local** state copies. State for the Cognito stack now lives in S3 only.

```bash
# Cognito — old workspace state before S3 migration (safe once cognito:setup succeeded)
rm -rf infra/stacks/cognito/terraform.tfstate.d

# Bootstrap — optional safety backup from a previous apply (not used by Terraform)
rm -f infra/bootstrap/terraform.tfstate.backup
```

**Keep these** (still required locally):


| Path                                | Why                                                   |
| ----------------------------------- | ----------------------------------------------------- |
| `infra/bootstrap/terraform.tfstate` | Bootstrap has no S3 backend; this is its active state |
| `infra/stacks/cognito/.terraform/`  | Provider cache; recreated by `terraform init`         |
| `infra/bootstrap/.terraform/`       | Same for bootstrap                                    |


Do **not** delete `infra/bootstrap/terraform.tfstate` unless you are intentionally abandoning bootstrap state management (you are not).

## Staging and production

```bash
cp infra/stacks/cognito/env/staging.tfvars.example infra/stacks/cognito/env/staging.tfvars
# Set app_url to your deployed web URL (e.g. https://staging.example.com)

bash scripts/terraform-cognito-apply.sh staging
bash scripts/terraform-cognito-sync-env.sh staging
```

- Workspace name must match `environment` in tfvars (`staging`, `prod`).
- `cognito:sync-env` only writes root `.env` for **dev**. For staging/prod, copy outputs into your deployment platform (Secrets Manager, Vercel, etc.).
- Do not commit `*.tfvars` — they may contain environment-specific URLs.

## Team access

### App-only developer (no Terraform)

1. Get root `.env` Cognito and Bedrock values from the team (1Password, etc.).
2. Clone repo, `pnpm install`, `docker compose up -d`, `pnpm db:deploy`.
3. Create personal login: `pnpm cognito:user dev@company.com '...'` (needs Cognito admin IAM on the shared account).
4. `pnpm dev`.

No bootstrap or `cognito:setup` required if the dev pool already exists.

### Infrastructure developer

1. IAM user or SSO access to the **same AWS account** with:
  - S3 read/write on `memrider-tfstate-`*
  - Cognito and related apply permissions
2. `aws login` / `aws configure` with their own credentials.
3. Bootstrap only if not done yet (`pnpm infra:bootstrap`).
4. `backend.hcl` is generated by bootstrap or copied from a teammate.
5. Coordinate `terraform apply` — one shared state per workspace.

