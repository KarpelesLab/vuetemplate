<script setup lang="ts">
import WelcomeItem from './WelcomeItem.vue'
import DocumentationIcon from './icons/IconDocumentation.vue'
import ToolingIcon from './icons/IconTooling.vue'
import EcosystemIcon from './icons/IconEcosystem.vue'
import CommunityIcon from './icons/IconCommunity.vue'
import SupportIcon from './icons/IconSupport.vue'
</script>

<template>
  <WelcomeItem>
    <template #icon>
      <DocumentationIcon />
    </template>
    <template #heading>Getting Started</template>

    Clone this
    <a href="https://github.com/KarpelesLab/vuetemplate" target="_blank" rel="noopener">template repository</a>
    to start building your new site. It comes pre-configured with Vue 3, TypeScript, Vue Router, and
    <a href="https://github.com/KarpelesLab/klbfw" target="_blank" rel="noopener">klbfw</a>
    for seamless integration with Karpeles Lab backend services.
  </WelcomeItem>

  <WelcomeItem>
    <template #icon>
      <ToolingIcon />
    </template>
    <template #heading>Dev Environment</template>

    Run <code>npm run dev</code> to start developing. The dev server automatically:
    <ul>
      <li>Injects the <code>FW</code> global variable (matching production behavior)</li>
      <li>Proxies API requests (<code>/_rest/</code> and <code>/_special/rest/</code>)</li>
      <li>Handles CSRF token validation</li>
      <li>Parses URL prefixes for language/currency context</li>
    </ul>
  </WelcomeItem>

  <WelcomeItem>
    <template #icon>
      <EcosystemIcon />
    </template>
    <template #heading>klbfw Features</template>

    The
    <a href="https://github.com/KarpelesLab/klbfw" target="_blank" rel="noopener">@karpeleslab/klbfw</a>
    package provides:
    <code>rest()</code> for API calls,
    <code>getPrefix()</code> for i18n URL prefixes,
    <code>getLocale()</code> for current language,
    and more. All API calls automatically include authentication headers.
  </WelcomeItem>

  <WelcomeItem>
    <template #icon>
      <CommunityIcon />
    </template>
    <template #heading>Version Management</template>

    Production builds include a service worker that adds <code>X-Version-Hint</code> headers
    to asset requests, enabling smart cache management. The git commit hash is automatically
    injected during build via the <code>%GIT_VERSION%</code> placeholder.
  </WelcomeItem>

  <WelcomeItem>
    <template #icon>
      <SupportIcon />
    </template>
    <template #heading>Resources</template>

    <a href="https://klb.jp/" target="_blank" rel="noopener">Karpeles Lab Inc.</a> |
    <a href="https://github.com/KarpelesLab/klbfw" target="_blank" rel="noopener">klbfw on GitHub</a> |
    <a href="https://github.com/KarpelesLab/vuetemplate" target="_blank" rel="noopener">This Template</a> |
    <a href="https://vuejs.org/" target="_blank" rel="noopener">Vue.js</a> |
    <a href="https://vite.dev/" target="_blank" rel="noopener">Vite</a>
  </WelcomeItem>
</template>
