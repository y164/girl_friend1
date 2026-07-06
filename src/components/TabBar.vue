<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { Home, MessageCircle, GraduationCap, MapPin, Heart, User, Calendar, Gamepad2, MoreHorizontal } from 'lucide-vue-next'
import { ref } from 'vue'

const router = useRouter()
const route = useRoute()

const showMore = ref(false)

const tabs = [
  { path: '/', icon: Home, label: '首页' },
  { path: '/chat', icon: MessageCircle, label: '聊天' },
  { path: '/biology', icon: GraduationCap, label: '助手' },
  { path: '/travel', icon: MapPin, label: '足迹' },
  { path: '/games', icon: Gamepad2, label: '游戏' }
]

const moreTabs = [
  { path: '/anniversary', icon: Calendar, label: '纪念日' },
  { path: '/album', icon: Heart, label: '相册' },
  { path: '/profile', icon: User, label: '我的' }
]

function isActive(path: string): boolean {
  return route.path === path
}

function navigate(path: string) {
  router.push(path)
  showMore.value = false
}

function toggleMore() {
  showMore.value = !showMore.value
}
</script>

<template>
  <nav class="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-100 px-2 py-1 z-50 pb-[env(safe-area-inset-bottom)]">
    <div class="max-w-md mx-auto flex justify-around items-center">
      <button
        v-for="tab in tabs"
        :key="tab.path"
        @click="navigate(tab.path)"
        class="flex flex-col items-center py-1 px-2 rounded-xl transition-all duration-300 flex-1"
        :class="isActive(tab.path) ? 'text-primary-500 bg-primary-50' : 'text-gray-400 hover:text-gray-600'"
      >
        <component :is="tab.icon" class="w-5 h-5 mb-0.5" />
        <span class="text-xs font-medium">{{ tab.label }}</span>
      </button>

      <div class="relative">
        <button
          @click="toggleMore"
          class="flex flex-col items-center py-1 px-2 rounded-xl transition-all duration-300 flex-1"
          :class="showMore ? 'text-primary-500 bg-primary-50' : 'text-gray-400 hover:text-gray-600'"
        >
          <MoreHorizontal class="w-5 h-5 mb-0.5" />
          <span class="text-xs font-medium">更多</span>
        </button>

        <div
          v-if="showMore"
          class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white rounded-2xl shadow-lg border border-gray-100 py-2 min-w-[120px]"
        >
          <button
            v-for="tab in moreTabs"
            :key="tab.path"
            @click="navigate(tab.path)"
            class="w-full flex items-center gap-2 px-4 py-2 transition-colors"
            :class="isActive(tab.path) ? 'text-primary-500 bg-primary-50' : 'text-gray-600 hover:bg-gray-50'"
          >
            <component :is="tab.icon" class="w-4 h-4" />
            <span class="text-sm">{{ tab.label }}</span>
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
nav {
  -webkit-tap-highlight-color: transparent;
}
</style>