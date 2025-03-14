# Marzian

Run and manage your long running processes.

## Table of contents

1. [Requirements](#1-requirements)
2. [Development](#2-development)
3. [Install and run](#3-install-and-run)
4. [Variables](#4-variables)

[License](LICENSE.md)

## 1. Requirements

- Node.js
- npm

## 2. Development

### Setup

```bash
npm run setup
```

If you want to source your environment variables from somewhere else rather than
from the provided .env file:

```bash
npm run setup -- --noenv
```

### Run (development)

```bash
npm run dev
```

Set a custom port by running:

```bash
npm run dev -- --port 4000
```

Defaults to `3000`.

## 3. Install and run

### Install

```bash
./install
```

The installation script is designed to be "battery-included." If Node.js is not
installed on the system, it will be installed using [nvm](https://github.com/nvm-sh/nvm)
(v18). Additionally, the script ensures that Marzian is enabled globally.

### Run (production)

From anywhere in the system:

```shell
marzian
```

Set a custom port by running:

```shell
marzian --port 4000
```

Defaults to `8080`.

## 4. Variables

See [`.env.template`](.env.template) and [`next.config.ts`](next.config.ts) for
all the available variables.

Environment variables should be typed in [`env.d.ts`](env.d.ts).
