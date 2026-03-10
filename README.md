# KLB Vue Template

A [Karpeles Lab Inc.](https://klb.jp/) base template for building websites with Vue 3, Vite, and [klbfw](https://github.com/KarpelesLab/klbfw).

## Features

- **Vue 3 + TypeScript** - Modern Vue development with full type support
- **Vite** - Fast build tool with hot module replacement
- **klbfw Integration** - Pre-configured [@karpeleslab/klbfw](https://github.com/KarpelesLab/klbfw) for API communication
- **Dev Environment** - Mimics production with FW variable injection and API proxying
- **Version Management** - Service worker adds version headers for smart cache management
- **i18n** - [vue-i18n](https://vue-i18n.intlify.dev/) with locale auto-detection via klbfw

## Start Checklist

When creating a new project from this template:

- [ ] Clone the repository
  ```sh
  git clone https://github.com/KarpelesLab/vuetemplate.git my-project
  cd my-project
  ```
- [ ] Change the git remote to your new project
  ```sh
  git remote set-url origin git@github.com:YourOrg/my-project.git
  ```
- [ ] Update `etc/registry_dev.ini` with your project's Realm ID
  ```ini
  Realm=usrr-xxxx-xxxx-xxxx-xxxx-xxxxxxxx
  ```
- [ ] Update `etc/i18n/user_flow.csv` with your project-specific wording (customize messages, add languages)
- [ ] Setup GitLab CI (copy `.gitlab-ci.yml` from an existing project or configure as needed)
- [ ] Install dependencies and start developing
  ```sh
  npm install
  npm run dev
  ```

## Configuration

### Registry Files

The `etc/registry.ini` and `etc/registry_dev.ini` files configure your environment:

**etc/registry.ini** (common settings):
```ini
Net_SSL_Force=1
Currency_List=USD
```

**etc/registry_dev.ini** (dev overrides):
```ini
Realm=usrr-xxxx-xxxx-xxxx-xxxx-xxxxxxxx
Net_SSL_Force=0
```

## Development

The dev server (`npm run dev`) automatically:

- **Injects FW variable** - Matches production behavior with context, locale, and CSRF token
- **Proxies API requests** - Routes `/_rest/` and `/_special/rest/` to the backend
- **Validates CSRF tokens** - Adds `Sec-Csrf-Token: valid` header when Authorization matches
- **Parses URL prefixes** - Handles `/l/en-US/`, `/c/USD/` style prefixes for i18n

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview production build locally |
| `npm run type-check` | Run TypeScript type checking |
| `npm run lint` | Lint and fix code (alias for lint:fix) |
| `npm run lint:check` | Check for linting errors |
| `npm run lint:fix` | Fix linting errors |

## klbfw Usage

```typescript
import { rest, getPrefix, getLocale } from '@karpeleslab/klbfw'

// Make API calls
const result = await rest('User:get', 'GET')

// Get URL prefix for i18n
const prefix = getPrefix() // e.g., "/l/en-US"

// Get current locale
const locale = getLocale() // e.g., "en-US"
```

## Internationalization (i18n)

The template uses [vue-i18n](https://vue-i18n.intlify.dev/) for client-side translations, initialized with the locale returned by `getLocale()` from klbfw.

### Client-side translations

Translation files are JSON files stored in `src/locale/<lang>/`, organized by namespace:

```
src/locale/
├── en-US/
│   └── common.json
└── fr-FR/
    └── common.json
```

All JSON files are auto-loaded at build time via `import.meta.glob`. Each file becomes a namespace matching its filename. For example, `src/locale/en-US/common.json`:

```json
{
  "hello": "Hello",
  "welcome": "Welcome"
}
```

Use translations in components with the `$t()` helper:

```vue
<template>
  <p>{{ $t('common.hello') }}</p>
</template>
```

Or with the Composition API:

```vue
<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>

<template>
  <p>{{ t('common.hello') }}</p>
</template>
```

To add a new language, create a matching directory under `src/locale/` with the same JSON files.

### Server-side translations

The `etc/i18n/` directory contains translations for server-side messages (API responses). These use CSV and INI formats and are processed by the klbfw dev plugin. See existing files for format examples.

### Language detection

The active locale is determined by `getLocale()` from klbfw, which reads the `/l/<lang>/` URL prefix. The `Language:local` API returns the list of enabled languages, which can be used to build a language selector.

## Production Build

```sh
npm run build
```

The build process:
1. Runs TypeScript type checking
2. Compiles and minifies assets
3. Injects git commit hash as version (`%GIT_VERSION%`)
4. Copies service worker for version header injection

## IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (disable Vetur if installed).

## Resources

- [Karpeles Lab Inc.](https://klb.jp/)
- [klbfw on GitHub](https://github.com/KarpelesLab/klbfw)
- [This Template](https://github.com/KarpelesLab/vuetemplate)
- [Vue.js Documentation](https://vuejs.org/)
- [Vite Documentation](https://vite.dev/)
