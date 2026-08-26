# Contributing Guidelines

Welcome! Thanks for considering contributing to the project.

## Design

### Software Architecture

The project is layed out following a simplified version of Feature-Sliced Design rules. I recommend [this](https://youtu.be/xyxrB2Aa7KE?si=JtJ3MzUs-9K57FUg) video by Kyle from [Web Dev Simplified](https://www.youtube.com/@WebDevSimplified). It outlines all the important concepts and provides examples to understand the design rules better. The gist of it (as relevant to the project) are as follow:

1. **Data Flow**: There are 3 main directories: `app`, `shared`, `features`. The `app` directory is the main orchestrator, it can call modules from both `shared` and `features`. `features`, however, can only call modules from `shared`. The idea is for the app to be separated into composable, specialized components such that the final app can be built from them
2. **Sub-directory Structure**: Every component has a `main.ts`, `styles.css` and `template.html` separation. Internal sub-directories mimick the FSD struture, for example: `assets/`, `components/`, `build/`, etc.
3. **Inter-component Communication**: Components can call sub-components, but the opposite is not true. Any "upward" form of communication is handled through standard `Browser Events`.

### Software Philosophy

1. **Contract-first Design**: Contract-first design, as Go's typesystem, is used throughout the project. Type inference is used, meaning that not every variable needs to have a type, unless it is used in way that the compiler allows it, but its use in the code is very specific to its actual type and not to a more general one.

## Development

### Tooling

- **Linter**: [ESlint](https://eslint.org/) is used, mostly for enforcing better coding practices.
- **Formatter**: [Prettier](https://prettier.io/) is the only formatter used.
- **Language Server Protocol (LSP)**: [VTSLS](https://vtsls.com/) is used for TS, [css-language-server](https://github.com/hrsh7th/vscode-langservers-extracted) for CSS, [html-language-server](https://github.com/hrsh7th/vscode-langservers-extracted) for HTML, [json-language-server](https://github.com/hrsh7th/vscode-langservers-extracted) for JSON, and [Marksman](https://github.com/artempyanykh/marksman) for Markdown.

### Tech Stack

This web app uses a Vanilla stack:

- **Frontend**: `TSX`, `HTML`, and `CSS`.
- **Build**: [Vite](https://vite.dev/).

### Localization

`i18next` is used for localization, however, the implementation varies a little from a main JSON with all the locales: every component that needs them has a `locales.json` file coallocated with the relevant markup. They feature standard locale names with nestable key-value pairs. At build-time, the locales are merged into a single JS Object, with the path to each `locales.json` prefixing each of the keys to avoid polluting the global scope.

This design decision was taken to keep everything related to a component within itself.

Currently, only English and Spanish are supported. The naming of muscle groups is not translated as they follow standard Greek-named medical terms.

### Commit Format

Commit messages follow standard [Conventional Commits v1.0.0](https://www.conventionalcommits.org/en/v1.0.0/) guidelines.
