<script setup lang="ts">
import { ref } from 'vue'
import { useAppStore } from '../stores/app'
import { generateLoveMessage } from '../api/ai'
import { User, Settings, Heart, Sparkles, Trash2, RefreshCw, Moon, Bell, Shield, Calendar, Save } from 'lucide-vue-next'

const appStore = useAppStore()

const isGenerating = ref(false)
const showDateModal = ref(false)
const editStartDate = ref(appStore.startDate)

const menuItems = [
  { icon: Bell, label: '提醒设置', description: '设置纪念日提醒时间' },
  { icon: Moon, label: '主题切换', description: '切换深色/浅色模式' },
  { icon: Shield, label: '数据备份', description: '导出和备份数据' },
  { icon: Settings, label: '其他设置', description: '更多选项' }
]

function openDateModal() {
  editStartDate.value = appStore.startDate
  showDateModal.value = true
}

function saveStartDate() {
  if (editStartDate.value) {
    appStore.startDate = editStartDate.value
    appStore.saveData()
    showDateModal.value = false
  }
}

async function refreshQuote() {
  isGenerating.value = true
  try {
    const quote = await generateLoveMessage()
    appStore.setDailyQuote(quote)
  } catch {
    appStore.setDailyQuote('爱你每一天，宝贝！')
  } finally {
    isGenerating.value = false
  }
}

function clearData() {
  if (confirm('确定要清空所有数据吗？此操作不可恢复。')) {
    appStore.clearChatHistory()
    localStorage.clear()
    location.reload()
  }
}
</script>

<template>
  <div class="min-h-screen pb-20 px-4 pt-6 bg-gradient-to-br from-primary-50 to-secondary-50">
    <div class="max-w-md mx-auto">
      <div class="bg-gradient-to-r from-primary-500 to-primary-600 rounded-3xl p-6 text-white shadow-lg mb-6">
        <div class="flex items-center gap-4 mb-4">
          <div class="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
            <User class="w-8 h-8" />
          </div>
          <div>
            <h1 class="text-xl font-bold">亲爱的宝贝</h1>
            <p class="text-primary-100 text-sm">专属AI女友助手 v1.0</p>
          </div>
        </div>
        
        <div class="bg-white/10 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p class="text-primary-100 text-xs mb-1">今日情话</p>
            <p class="text-sm font-medium">{{ appStore.dailyQuote }}</p>
          </div>
          <button
            @click="refreshQuote"
            :disabled="isGenerating"
            class="p-2 rounded-full bg-white/20 hover:bg-white/30 disabled:opacity-50 transition-all"
          >
            <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': isGenerating }" />
          </button>
        </div>
      </div>

      <div class="bg-white rounded-2xl p-5 shadow-sm mb-6">
        <h2 class="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Heart class="w-5 h-5 text-primary-500" />
          恋爱统计
        </h2>
        <div class="grid grid-cols-3 gap-4 mb-4">
          <div class="text-center">
            <p class="text-3xl font-bold text-primary-500">{{ appStore.loveDays }}</p>
            <p class="text-xs text-gray-500">恋爱天数</p>
          </div>
          <div class="text-center">
            <p class="text-3xl font-bold text-secondary-500">{{ appStore.diaryList.length }}</p>
            <p class="text-xs text-gray-500">日记篇数</p>
          </div>
          <div class="text-center">
            <p class="text-3xl font-bold text-green-500">{{ appStore.anniversaryList.length }}</p>
            <p class="text-xs text-gray-500">纪念天数</p>
          </div>
        </div>
        <button
          @click="openDateModal"
          class="w-full flex items-center justify-center gap-2 bg-primary-50 hover:bg-primary-100 text-primary-600 py-3 rounded-xl font-medium transition-all"
        >
          <Calendar class="w-5 h-5" />
          设置恋爱开始日期
        </button>
      </div>

      <div class="bg-white rounded-2xl p-5 shadow-sm mb-6">
        <h2 class="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Settings class="w-5 h-5 text-gray-500" />
          设置
        </h2>
        <div class="space-y-2">
          <button
            v-for="item in menuItems"
            :key="item.label"
            class="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-all"
          >
            <div class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              <component :is="item.icon" class="w-5 h-5 text-gray-600" />
            </div>
            <div class="flex-1 text-left">
              <p class="font-medium text-gray-800">{{ item.label }}</p>
              <p class="text-xs text-gray-500">{{ item.description }}</p>
            </div>
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div class="bg-white rounded-2xl p-5 shadow-sm">
        <h2 class="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Sparkles class="w-5 h-5 text-purple-500" />
          关于
        </h2>
        <div class="space-y-4">
          <div class="p-4 bg-gray-50 rounded-xl">
            <p class="text-sm text-gray-600">
              这是一个专门为你打造的AI助手，融合了浪漫与实用功能。
              <br/>
              <br/>
              💡 功能包括：
              <br/>
              • AI聊天陪伴
              <br/>
              • 生物教学助手
              <br/>
              • 纪念日管理
              <br/>
              • 心情日记
              <br/>
              • 健康打卡
              <br/>
              • 礼物推荐
            </p>
          </div>
          <button
            @click="clearData"
            class="w-full flex items-center justify-center gap-2 text-red-500 py-3 rounded-xl hover:bg-red-50 transition-all"
          >
            <Trash2 class="w-5 h-5" />
            清空所有数据
          </button>
        </div>
      </div>

      <p class="text-center text-gray-400 text-xs mt-8">
        Made with 💖 for my girlfriend
      </p>
    </div>

    <div v-if="showDateModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-3xl p-6 w-full max-w-sm mx-4">
        <h2 class="text-xl font-bold text-gray-800 mb-4">设置恋爱开始日期</h2>
        <p class="text-sm text-gray-500 mb-4">选择你们第一次见面或表白成功的日期</p>
        <input
          v-model="editStartDate"
          type="date"
          :max="new Date().toISOString().split('T')[0]"
          class="w-full bg-gray-50 rounded-xl px-4 py-3 border-none outline-none text-gray-800 mb-6"
        />
        <div class="flex gap-3">
          <button
            @click="showDateModal = false"
            class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-medium transition-all"
          >
            取消
          </button>
          <button
            @click="saveStartDate"
            class="flex-1 bg-primary-500 hover:bg-primary-600 text-white py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
          >
            <Save class="w-5 h-5" />
            保存
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
