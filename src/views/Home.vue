<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAppStore } from '../stores/app'
import { Heart, Calendar, MessageCircle, GraduationCap, BookOpen, Droplets, Gift, Star, MapPin, Gamepad2 } from 'lucide-vue-next'
import dayjs from 'dayjs'

const router = useRouter()
const appStore = useAppStore()

const quickActions = [
  { icon: MessageCircle, label: '聊天', path: '/chat', color: 'bg-primary-500' },
  { icon: GraduationCap, label: '生物助手', path: '/biology', color: 'bg-secondary-500' },
  { icon: MapPin, label: '足迹', path: '/travel', color: 'bg-orange-400' },
  { icon: Gamepad2, label: '小游戏', path: '/games', color: 'bg-indigo-400' },
  { icon: Calendar, label: '纪念日', path: '/anniversary', color: 'bg-yellow-400' },
  { icon: BookOpen, label: '心情日记', path: '/tools', color: 'bg-pink-400' },
  { icon: Droplets, label: '健康打卡', path: '/tools', color: 'bg-cyan-400' },
  { icon: Heart, label: '相册', path: '/album', color: 'bg-red-400' }
]

function formatDate(date: string): string {
  return dayjs(date).format('MM月DD日')
}

function navigate(path: string) {
  router.push(path)
}
</script>

<template>
  <div class="min-h-screen pb-20 px-4 pt-6">
    <div class="max-w-md mx-auto">
      <div class="bg-gradient-to-r from-primary-500 to-primary-600 rounded-3xl p-6 text-white shadow-lg mb-6">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h1 class="text-2xl font-bold mb-1">亲爱的宝贝</h1>
            <p class="text-primary-100 text-sm">{{ dayjs().format('YYYY年MM月DD日') }}</p>
          </div>
          <div class="animate-float">
            <Heart class="w-10 h-10 text-red-300 fill-red-300" />
          </div>
        </div>
        
        <div class="bg-white/20 backdrop-blur-sm rounded-2xl p-4 mb-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-primary-100 text-xs mb-1">我们在一起已经</p>
              <p class="text-4xl font-bold">{{ appStore.loveDays }} <span class="text-lg">天</span></p>
            </div>
            <div class="text-right">
              <p class="text-primary-100 text-xs mb-1">距离下次纪念日</p>
              <p class="text-2xl font-bold">{{ appStore.nextAnniversary.days }} <span class="text-sm">天</span></p>
            </div>
          </div>
          <p class="text-center text-primary-100 text-sm mt-2">{{ appStore.nextAnniversary.anniversary?.name || '纪念日' }} · {{ formatDate(appStore.nextAnniversary.anniversary?.date || '') }}</p>
        </div>
        
        <div class="bg-white/10 rounded-xl p-3 flex items-start gap-3">
          <Star class="w-5 h-5 text-yellow-300 flex-shrink-0 mt-0.5" />
          <p class="text-sm leading-relaxed">{{ appStore.dailyQuote }}</p>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4 mb-6">
        <button
          v-for="action in quickActions"
          :key="action.path"
          @click="navigate(action.path)"
          class="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col items-center gap-2"
        >
          <div :class="[action.color, 'rounded-xl p-3']">
            <component :is="action.icon" class="w-6 h-6 text-white" />
          </div>
          <span class="text-gray-700 font-medium">{{ action.label }}</span>
        </button>
      </div>

      <div class="bg-white rounded-2xl p-5 shadow-sm mb-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Calendar class="w-5 h-5 text-primary-500" />
            近期纪念日
          </h2>
          <button @click="navigate('/anniversary')" class="text-primary-500 text-sm">查看全部</button>
        </div>
        <div class="space-y-3">
          <div
            v-for="item in appStore.anniversaryList.slice(0, 3)"
            :key="item.id"
            class="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
          >
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                <Heart v-if="item.type === 'anniversary'" class="w-5 h-5 text-primary-500" />
                <Gift v-else class="w-5 h-5 text-secondary-500" />
              </div>
              <div>
                <p class="font-medium text-gray-800">{{ item.name }}</p>
                <p class="text-xs text-gray-500">{{ formatDate(item.date) }}</p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-primary-500 font-bold">{{ dayjs(item.date).diff(dayjs(), 'day') }}天后</p>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-gradient-to-br from-secondary-100 to-primary-50 rounded-2xl p-5 shadow-sm">
        <h2 class="text-lg font-bold text-gray-800 mb-3">今日健康打卡</h2>
        <div v-if="appStore.todayHealth" class="grid grid-cols-3 gap-4">
          <div class="text-center">
            <div class="w-12 h-12 mx-auto mb-2 rounded-full bg-blue-100 flex items-center justify-center">
              <Droplets class="w-6 h-6 text-blue-500" />
            </div>
            <p class="text-2xl font-bold text-blue-600">{{ appStore.todayHealth.water }}</p>
            <p class="text-xs text-gray-500">杯水</p>
          </div>
          <div class="text-center">
            <div class="w-12 h-12 mx-auto mb-2 rounded-full bg-green-100 flex items-center justify-center">
              <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <p class="text-2xl font-bold text-green-600">{{ appStore.todayHealth.steps }}</p>
            <p class="text-xs text-gray-500">步</p>
          </div>
          <div class="text-center">
            <div class="w-12 h-12 mx-auto mb-2 rounded-full bg-purple-100 flex items-center justify-center">
              <svg class="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <p class="text-2xl font-bold text-purple-600">{{ appStore.todayHealth.sleep }}</p>
            <p class="text-xs text-gray-500">小时</p>
          </div>
        </div>
        <div v-else class="text-center py-8">
          <p class="text-gray-500 mb-3">还没有今日打卡记录</p>
          <button @click="navigate('/tools')" class="bg-primary-500 text-white px-6 py-2 rounded-full text-sm font-medium">去打卡</button>
        </div>
      </div>
    </div>
  </div>
</template>
