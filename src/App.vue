<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from './stores/app'
import TabBar from './components/TabBar.vue'

const route = useRoute()
const appStore = useAppStore()

const showTabBar = computed(() => {
  return !['/chat'].includes(route.path)
})

onMounted(() => {
  appStore.loadData()
})
</script>

<template>
  <div class="min-h-screen w-full">
    <router-view />
    <TabBar v-if="showTabBar" />
  </div>
</template>
