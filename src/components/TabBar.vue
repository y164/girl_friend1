<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { Home, MessageCircle, GraduationCap, MapPin, Heart, User, Calendar, Gamepad2 } from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()

const tabs = [
  { path: '/', icon: Home, label: '首页' },
  { path: '/chat', icon: MessageCircle, label: '聊天' },
  { path: '/biology', icon: GraduationCap, label: '助手' },
  { path: '/travel', icon: MapPin, label: '足迹' },
  { path: '/games', icon: Gamepad2, label: '游戏' },
  { path: '/anniversary', icon: Calendar, label: '纪念日' },
  { path: '/album', icon: Heart, label: '相册' },
  { path: '/profile', icon: User, label: '我的' }
]

function isActive(path: string): boolean {
  return route.path === path
}

function navigate(path: string) {
  router.push(path)
}
</script>

<template>
  <nav class="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-100 px-4 py-2 z-50">
    <div class="max-w-md mx-auto flex justify-around items-center">
      <button
        v-for="tab in tabs"
        :key="tab.path"
        @click="navigate(tab.path)"
        class="flex flex-col items-center py-1 px-3 rounded-xl transition-all duration-300"
        :class="isActive(tab.path) ? 'text-primary-500 bg-primary-50' : 'text-gray-400 hover:text-gray-600'"
      >
        <component :is="tab.icon" class="w-6 h-6 mb-1" />
        <span class="text-xs font-medium">{{ tab.label }}</span>
      </button>
    </div>
  </nav>
</template>
