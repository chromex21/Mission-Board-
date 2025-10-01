# Mission-Board

Mission-Board is a small task/mission tracking app built with React. It provides user profiles, mission creation and tracking, achievements, teams, and notification history. This repository contains a Create React App project scaffold plus application source code in `src/`.

Core Features
- User accounts (Firebase Authentication)
- Mission creation and tracking (title, description, points, recurrence, tags)
- Achievements and points/streak tracking
- Notifications with transient toasts and persisted history
- Optional dev JSON server to persist data locally during development

Tech & Setup Notes
- Frontend: React (Create React App)
- Auth: Firebase Authentication (Email/Password + Google)
- Local persistence: browser localStorage; optional dev JSON server controlled by `REACT_APP_DATA_URL`

## Getting Started (local development)

In the project directory, you can run:

### `npm install`

Install dependencies.

### `npm start`

Runs the app in development mode.
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload when you make changes. You may also see any lint errors in the console.

### Optional: start local dev JSON server

This project includes a small dev JSON server in `scripts/` that provides endpoints for `/data`, `/profiles`, and `/missions`. To run it in development, open a second terminal and run:

```powershell
npm run dev-data
```

By default the server listens on port 4000 and writes to `data.json` in the repository root. The app can be pointed to it by setting the environment variable `REACT_APP_DATA_URL` (example shown below).

### `REACT_APP_DATA_URL` (optional)

To make the app use the local dev server for persistence, start the dev server and then run:

```powershell
#$env:REACT_APP_DATA_URL='http://localhost:4000'; npm start
```

### `npm run build`

Builds the app for production to the `build` folder.

## Learn More

This project was bootstrapped with Create React App. See the CRA docs for details on advanced usage and deployment.

---

*(Merged README: kept your original project description and added the CRA getting-started instructions.)*

## Git workflow: backing up before rewriting history

When you need to rebase or otherwise rewrite history, create a lightweight or annotated backup tag so you can recover the pre-rewrite state without leaving an extra branch:

```powershell
# create an annotated tag pointing to the current commit
git tag -a backup/main-before-rebase -m "Backup of local main before rebase on $(Get-Date -Format 'yyyy-MM-dd')"
# push the tag to origin
git push origin backup/main-before-rebase
```

You can delete the tag later with `git tag -d backup/main-before-rebase` (local) and `git push --delete origin backup/main-before-rebase` (remote).

Using a tag avoids cluttering the branch list while keeping an easy recovery point.
