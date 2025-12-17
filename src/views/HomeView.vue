<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { rest } from '@karpeleslab/klbfw'
import TheWelcome from '../components/TheWelcome.vue'

const apiTestResult = ref<string>('Testing...')
const apiTestStatus = ref<'pending' | 'success' | 'error'>('pending')

onMounted(async () => {
  try {
    const result = await rest('Misc/Debug:securePost', 'POST')
    if (result?.data?.ok === true) {
      apiTestResult.value = 'API test passed: {"data":{"ok":true}}'
      apiTestStatus.value = 'success'
    } else {
      apiTestResult.value = `Unexpected response: ${JSON.stringify(result)}`
      apiTestStatus.value = 'error'
    }
  } catch (error) {
    apiTestResult.value = `API test failed: ${error}`
    apiTestStatus.value = 'error'
  }
})
</script>

<template>
  <main>
    <div class="api-test" :class="apiTestStatus">
      <strong>klbfw API Test:</strong> {{ apiTestResult }}
    </div>
    <TheWelcome />
  </main>
</template>

<style scoped>
.api-test {
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 4px;
  font-family: monospace;
}
.api-test.pending {
  background: #fff3cd;
  color: #856404;
}
.api-test.success {
  background: #d4edda;
  color: #155724;
}
.api-test.error {
  background: #f8d7da;
  color: #721c24;
}
</style>
