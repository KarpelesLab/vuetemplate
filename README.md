# KLB Vue Template

A [Karpeles Lab Inc.](https://klb.jp/) base template for building websites with Vue 3, Vite, and [klbfw](https://github.com/KarpelesLab/klbfw).

## Features

- **Vue 3 + TypeScript** - Modern Vue development with full type support
- **Vite** - Fast build tool with hot module replacement
- **klbfw Integration** - Pre-configured [@karpeleslab/klbfw](https://github.com/KarpelesLab/klbfw) for API communication
- **Dev Environment** - Mimics production with FW variable injection and API proxying
- **Version Management** - Service worker adds version headers for smart cache management

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
