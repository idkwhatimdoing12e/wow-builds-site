# Character sharing: setup and release

This change targets `idkwhatimdoing12e/wow-builds-site`, based on its `dungeon-journal` branch. That branch contains the live journal application and `/character`; `main` contained the older builds application when checked. Confirm your Vercel project's production branch before merging. Do not replace the journal application with the older `main` tree.

## 1. Create the R2 bucket

1. Sign in to the Cloudflare dashboard, choose your account, then open **Storage & databases → R2 object storage** (or **R2 object storage** in the sidebar).
2. Enable R2 if this account has not used it yet. Review any billing agreement yourself.
3. Select **Create bucket**. Name it `foreverjournal-characters`.
4. Select **Standard** storage and the default/automatic location. Use the default jurisdiction for this implementation; an EU-restricted jurisdiction has a different endpoint.
5. Create the bucket. Keep its public development URL disabled and do not add a public custom domain. The website accesses R2 on the server; visitors must not be able to list or download its objects directly. No browser CORS policy is required.

Cloudflare reference: https://developers.cloudflare.com/r2/buckets/create-buckets/

## 2. Create the R2 credentials

1. Return to the R2 overview and open **Manage R2 API Tokens** / **Manage API Tokens**.
2. Choose **Create Account API token** (a user token also works if your account only offers that option).
3. Name it `foreverjournal-vercel-characters`.
4. Choose **Object Read & Write** and scope it to **only** `foreverjournal-characters`.
5. Choose the intended token lifetime. Do not restrict it to a guessed Vercel outbound IP.
6. Create the token. Save its **Access Key ID** and **Secret Access Key** in your password manager. These S3 credentials are the values needed below, not the Cloudflare API token string.
7. Copy your **Account ID** from the R2 overview. The endpoint must be `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`.

Cloudflare reference: https://developers.cloudflare.com/r2/api/tokens/

## 3. Add the Vercel environment variables

Open the existing website project → **Settings → Environment Variables**. Add:

| Name | Value |
| --- | --- |
| `R2_ACCOUNT_ID` | Your Cloudflare account ID |
| `R2_ACCESS_KEY_ID` | The R2 token's Access Key ID |
| `R2_SECRET_ACCESS_KEY` | The R2 token's Secret Access Key |
| `R2_BUCKET` | `foreverjournal-characters` |

Enable these for **Production**. Mark credentials sensitive where offered. Never prefix them with `NEXT_PUBLIC_` or commit actual values. Redeploy after adding them; existing deployments do not acquire newly configured variables.

For Preview deployments, create a separate bucket such as `foreverjournal-characters-preview` and a separately scoped token, then use those four values for **Preview**. This prevents a test deployment from changing real profiles. `.env.example` lists the names for local development.

No Redis service, extra rate-limit secret, Vercel cron, or Cloudflare public bucket is needed.

## 4. Configure automatic deletion — required

Open the bucket → **Settings → Object lifecycle rules → Add rule**:

| Rule name | Prefix | Action |
| --- | --- | --- |
| `expire-character-exports` | `chars/` | Delete objects 365 days after last modification |
| `expire-import-limits` | `limits/` | Delete objects 1 day after last modification |

Enable both rules. Apply the same rules to the preview bucket if you created one. Leave the default incomplete-multipart-upload rule in place.

The retention policy treats 12 months as 365 days. Updating a character replaces its object and restarts its retention clock. The server hides expired objects on reads, with a cache lifetime of one hour. R2 handles physical deletion, normally within 24 hours after expiration. A character URL can be claimed again once its expired object is physically deleted; do not describe it as perpetual storage.

Each character has one object at `chars/<slug>.json`. `limits/` holds small, short-lived rate-limit counters and contains HMACs of IP addresses, never raw IP addresses. Limits are shared across Vercel instances: ten import attempts per IP per ten-minute window. These counters add R2 read/write operations; the free allowance is not unlimited capacity.

Cloudflare reference: https://developers.cloudflare.com/r2/buckets/object-lifecycles/

## 5. Release and verify

1. Merge the feature commit into the journal branch used by Vercel, or deploy the feature branch as a preview first.
2. Confirm the build succeeds. Locally: `npm ci`, `npm run test:character`, `npm run build`. On this Windows workspace the build was verified with `npm run build -- --webpack` after Turbopack's worker launch failed.
3. Install the supplied addon ZIP with `ForeverDungeonJournal/` directly inside `Interface/AddOns/`, then restart WoW or `/reload`.
4. Type `/dj export`, select all, copy, and paste into `https://www.foreverjournal.pro/character`. Publish it. You should land at `/c/<name>-<realm>`.
5. Open **Character Logs**, select a run, and compare it with the same run in game. Timers are frozen at export, including an active run or Death Walk. Check a killed boss, an unseen rare, a Need win/loss and a run with no Need rolls.
6. Copy the page link and open it in another browser. It must work without localStorage or an export code.
7. Export again after making progress. The URL must remain the same and show the new snapshot. An older export is rejected instead of rolling progress back.
8. Test an old FDJ1 or FDJ2 code in the legacy viewer. It remains browser-only because it has no ownership key.

The updated addon retains the newest 100 saved runs in each export. Trash kills are grouped by mob name exactly as the log UI groups them, avoiding thousands of redundant kill records. No runs are silently dropped below that limit. Codes over 50 KiB are rejected with a clear instruction to remove older saved runs before exporting again; expanded JSON is limited to 2 MiB.

## Ownership and recovery

`ForeverDungeonJournalCharacterDB.exportKey` is created once per character and retained in its SavedVariables. Keep a backup of the character's SavedVariables when reinstalling or moving WoW. Anyone with a raw FDJ3 export has its update key, so share the `/c/…` link, not the export code. The site stores only SHA-256 of the key; it never stores the raw code or key and never sends either back to the public page.

This is possession-based update ownership, not Blizzard authentication or proof of genuine gameplay. WoW exposes no cryptographic random generator; the addon uses 48 persisted random alphanumeric draws without reseeding the game's shared generator. A first claimant reserves the name/realm, and losing the key requires an owner-assisted recovery policy outside this feature. Conditional R2 writes prevent two concurrent imports from claiming or overwriting the same profile under different keys.

FDJ3 is `FDJ3.<base64url(raw-DEFLATE(JSON))>.<base36(Adler32(JSON UTF-8 bytes))>`. The checksum detects damaged copies; it is not an authentication signature. Schema and field limits live in `app/lib/character-snapshot.ts`.

## Libraries and verification limits

Bundled LibDeflate is the official SafeteeWoW 1.0.2-release source, commit `afc3b78d12fb3bcfa6b21e5332031ad3d7572e19`. Its actual license is **zlib**, not MIT; the original license is included. The only integration change exposes the standalone library to the addon when LibStub is absent.

Automated checks cover Lua 5.1 compilation, actual Lua/LibDeflate exports decoded by the website, legacy formats, checksum/schema/size rejection, decompression limits, stable Unicode slugs, ownership, stale updates, concurrent claims, rate limiting and expiry. The production build and local HTTP render checks passed. Browser screenshot inspection was blocked by the preview connection. Live WoW UI behavior and live R2/Vercel integration require the release checks above; no Cloudflare credentials were supplied in this task.

## Vercel plan

Move this AdSense-supported site to **Vercel Pro** before commercial operation. Vercel Hobby is limited to personal, non-commercial use. This task does not change your plan or accept any billing agreement.

Vercel references: https://vercel.com/docs/plans/hobby and https://vercel.com/docs/limits/fair-use-guidelines
