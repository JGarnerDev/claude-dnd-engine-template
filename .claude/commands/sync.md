Sync shareable engine files to the template repo.

---

## Step 1 — Read config

Read two files from the project root:
- `.template-sync` — include and exclude patterns for shareable files (committed, no path here)
- `.template-sync.local` — contains `template=<absolute path>` to the template repo (gitignored, machine-specific)

If `.template-sync` is missing, stop. If `.template-sync.local` is missing, tell the DM: "Create `.template-sync.local` with `template=<path to your local clone of the template repo>`."

Extract the `template=` value → absolute path to the template repo. Verify that path exists on disk before continuing.

**Parsing `.template-sync`:** skip blank lines and lines starting with `#`. Lines starting with `!` are exclusions — strip the `!` and treat as a glob pattern for files to remove from the candidate set. All other lines are include patterns. Process the full file top-to-bottom; later rules override earlier ones (same semantics as `.gitignore`). Build the final candidate list as: all files matched by any include pattern, minus all files matched by any exclusion pattern.

---

## Step 2 — Diff main vs template

For each file in the final candidate list, check this repo against the template repo:
- Check if the corresponding file exists in the template repo at the same relative path
- If it exists, compare content (read both files)
- Classify as: **new** (only in main), **changed** (differs), or **identical** (skip)

---

## Step 3 — Preview and confirm

Report:
- Files that will be copied: [new or changed, with classification]
- Files in the template repo matching shareable patterns that no longer exist here: [stale — flag but don't delete automatically]

Ask: *"Sync N file(s) to the template repo?"*

Wait for confirmation before writing anything.

---

## Step 4 — Copy files

For each new or changed file:
1. Create parent directories in the template repo if they don't exist
2. Copy the file from `{main_repo}/{file}` to `{template_repo}/{file}`

---

## Step 5 — Commit and push in template repo

In the template repo directory:
1. `git add` all copied files
2. Commit — message should summarize what changed (e.g. "sync: update session command and entity-creation protocol")
3. `git push origin`

Report what was committed and whether the push succeeded.
