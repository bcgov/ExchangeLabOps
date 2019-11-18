# Overview

A repository may have one or more modules. A module defines how granular an application can be built/deployed. A module may have multiple components.

For example, a reposiroy can have the main app module at the root of the repository. In addition, it may also have multiple supporting modules (e.g.: Jenkins, SonarQube, etc..).

Each module have its own `.pipeline` folder, as well as probably its own `Jenkinsfile`.

# Pipeline Directory Structure

The pipeline directory is a node/npm project directory.
```
.pipeline
├── lib
|   ├── build.js
|   ├── clean.js
|   ├── config.js
|   └── deploy.js
├── build.js
├── clean.js
├── deploy.js
├── package-lock.json
└── package.json
```

An overview of what each of these does:

| File               | Description |
|:-------------------|:------------|
| lib/build.js       |             |
| lib/clean.js       |             |
| lib/config.js      |             |
| lib/deploy.js      |             |
| build.js           | npm script entrypoint for `npm run build` which combibes `lib/config.js` + `lib/build.js` |
| clean.js           | npm script entrypoint for `npm run clean` which combibes `lib/config.js` + `lib/clean.js` |
| deploy.js          | npm script entrypoint for `npm run deploy` which combibes `lib/config.js` + `lib/deploy.js`|
| package-lock.json  |                                           |
| package.json       | npm's [package.json](https://docs.npmjs.com/files/package.json)|