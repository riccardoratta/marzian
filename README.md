# marzian

Ti voglio bene.

## Table of contents

1. [Requirements](#1-requirements)
2. [Install and run](#2-install-and-run)
3. [Build and run](#3-build-and-run)
4. [Variables](#4-variables)

[Changelog](CHANGELOG.md)

[License](LICENSE.md)

## 1. Requirements

- Node.js (21.7.3)
- npm (latest)
- esno (latest)

## 2. Setup and run (development)

### Setup

```bash
npm run setup
```

### Run

```bash
npm run dev
```

It is possible to specify the port with

```bash
npm run dev -- port 4000
```

Otherwise it defaults to 3000 (default development port).

## 3. Install and run

### Install

```bash
./install
```

The installation script is intended to be "battery-included". If node is not installed on the system, it will be pulled with [nvm](https://github.com/nvm-sh/nvm) (v. 18). Also the install script takes care of enabling marzian globally.

### Run

From anywhere in the system

```
marzian
```

It is possible to specify the port with

```
marzian --port 4000
```

Otherwise it defaults to 8080 (default production port).

## 4. Variables

See [`.env.template`](.env.template) for all the available variables.

Environment variables should be typed in [`process.d.ts`](process.d.ts).
