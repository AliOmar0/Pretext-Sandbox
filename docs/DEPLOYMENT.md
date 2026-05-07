# Deployment

The playground is a fully static frontend, so anywhere that serves files works. The repo includes a ready-to-go GitHub Pages workflow.

## GitHub Pages (recommended)

The workflow lives at `.github/workflows/deploy-pretext-playground.yml` and deploys on every push to `main`.

### One-time setup

1. Push the repo to GitHub.
2. In the repo on GitHub, go to **Settings → Pages → Build and deployment → Source** and choose **GitHub Actions**.
3. Push to `main` (or trigger the workflow manually under the Actions tab). When the **deploy** job completes it shows a URL like `https://<user>.github.io/<repo>/`.

### What the workflow does

- Installs the pnpm workspace with `--frozen-lockfile`.
- Builds the composite TypeScript libs first (`pnpm run typecheck:libs`).
- Computes the correct `BASE_PATH`:
  - `<user>.github.io` repo → `/`
  - Any repo containing `artifacts/pretext-playground/public/CNAME` → `/`
  - Anything else → `/<repo-name>/`
- Runs the playground build with `PORT` and `BASE_PATH` in the environment (the Vite config requires both even at build time).
- Copies `dist/public/index.html` to `404.html` so direct loads of `/showcase/:id` URLs work — GitHub Pages has no server-side rewrite, so it falls back to `404.html` for unknown paths and we serve the SPA from there.
- Uploads `artifacts/pretext-playground/dist/public` and deploys via the official `actions/deploy-pages@v4`.

### Custom domain

1. Add a `CNAME` file containing your domain at `artifacts/pretext-playground/public/CNAME` (Vite will copy it into the build output).
2. Configure your DNS to point at `<user>.github.io`.
3. The next deploy will serve from `/` (no subpath), and GitHub Pages will pick up the CNAME automatically.

### Branches and pull-request previews

The workflow runs only on `main` by default. To preview a branch before merging, run the workflow manually from the Actions tab and choose your branch — the deploy will overwrite the live URL, so use sparingly. For dedicated PR previews you'd want a third-party hosting (Cloudflare Pages, Vercel) since GitHub Pages only has one live environment per repo.

## Other static hosts

The build produces a plain folder of static files. Any of these will work — the only host-specific concern is the SPA fallback for client-side routes.

| Host           | Output dir                              | Base path env       | SPA fallback                                                                 |
| -------------- | --------------------------------------- | ------------------- | ---------------------------------------------------------------------------- |
| GitHub Pages   | `artifacts/pretext-playground/dist/public` | `BASE_PATH=/<repo>/` | Copy `index.html` → `404.html` (workflow does this)                          |
| Cloudflare Pages | same                                  | `BASE_PATH=/`       | Add a `_redirects` file with `/*  /index.html  200`                          |
| Netlify        | same                                    | `BASE_PATH=/`       | Same as above; or use `[[redirects]]` in `netlify.toml`                      |
| Vercel         | same                                    | `BASE_PATH=/`       | Configured automatically for SPAs; no extra file needed                       |
| S3 + CloudFront | same                                   | `BASE_PATH=/` or subpath | CloudFront error page rule: 404 → `/index.html` with status 200          |
| nginx (self-hosted) | same                                | `BASE_PATH=/` or subpath | `try_files $uri /index.html;`                                            |

The build command in every case:

```bash
PORT=5173 BASE_PATH=/ pnpm --filter @workspace/pretext-playground run build
```

(`PORT` is required by the Vite config but unused at build time — any value works.)

## Troubleshooting

**Blank page, console says "Failed to load module … 404."**
Almost always a base-path mismatch. Check that `BASE_PATH` matches the URL prefix the site is served from (with a leading and trailing slash).

**Deep-linked `/showcase/:id` URLs return 404 in production.**
The SPA fallback isn't wired up. Confirm `404.html` exists alongside `index.html` in your deploy output (GitHub Pages, Cloudflare, Netlify) or that your host has the equivalent rewrite (Vercel, nginx).

**Workflow fails at "Install dependencies".**
Make sure `pnpm-lock.yaml` is committed and up-to-date with `package.json`. Run `pnpm install` locally and commit the lockfile change.

**Workflow fails at the build step with `BASE_PATH environment variable is required`.**
The build was started without the env var — only relevant if you're running the build locally outside the workflow. Use the command in the table above.
