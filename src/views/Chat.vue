<script setup lang="ts">
import { ref, nextTick, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../stores/app'
import { chatWithAI, generateLoveMessage } from '../api/ai'
import { Send, Heart, Sparkles, Home, Mic, MicOff, Search, RotateCcw } from 'lucide-vue-next'

const router = useRouter()
const appStore = useAppStore()

const inputMessage = ref('')
const isLoading = ref(false)
const messagesContainer = ref<HTMLElement | null>(null)
const searchQuery = ref('')
const showSearch = ref(false)
const isRecording = ref(false)
const recognition = ref<any>(null)
const recordingTime = ref(0)
let recordingTimer: ReturnType<typeof setInterval> | null = null

const currentMode = ref<'normal' | 'love'>('normal')

const systemPrompts = {
  normal: '你是一个温柔体贴的AI男友，说话甜蜜、关心对方，像真正的男朋友一样聊天。',
  love: '你是一个超级浪漫的AI男友，说话充满爱意和甜蜜，每句话都要包含情话。'
}

const displayedMessages = computed(() => {
  if (showSearch.value && searchQuery.value.trim()) {
    return appStore.chatHistory.filter(msg => 
      msg.content.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }
  return appStore.chatHistory.length > 0 ? appStore.chatHistory : [
    {
      id: 'welcome',
      role: 'assistant' as const,
      content: '亲爱的宝贝，我是你的专属AI男友！今天想聊点什么呢？\n\n💡 你可以试试：\n• 跟我说说今天发生了什么\n• 让我讲个笑话给你听\n• 切换到情话模式\n• 问我关于生物的问题',
      timestamp: new Date().toISOString()
    }
  ]
})

async function sendMessage() {
  if (!inputMessage.value.trim() || isLoading.value) return

  const message = inputMessage.value.trim()
  inputMessage.value = ''

  appStore.addChatMessage({
    role: 'user',
    content: message,
    timestamp: new Date().toISOString()
  })

  await nextTick()
  scrollToBottom()

  isLoading.value = true

  try {
    const messages = [
      { role: 'system', content: systemPrompts[currentMode.value] },
      ...displayedMessages.value.slice(-10).map(m => ({
        role: m.role,
        content: m.content
      }))
    ]

    const response = await chatWithAI(messages)
    appStore.addChatMessage({
      role: 'assistant',
      content: response.content,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Send message error:', error)
  } finally {
    isLoading.value = false
    await nextTick()
    scrollToBottom()
  }
}

async function generateLoveQuote() {
  isLoading.value = true
  try {
    const quote = await generateLoveMessage()
    appStore.addChatMessage({
      role: 'assistant',
      content: quote,
      timestamp: new Date().toISOString()
    })
  } catch {
    appStore.addChatMessage({
      role: 'assistant',
      content: '想你了，宝贝！你是我生命中最美的风景~',
      timestamp: new Date().toISOString()
    })
  } finally {
    isLoading.value = false
    await nextTick()
    scrollToBottom()
  }
}

function scrollToBottom() {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

function toggleMode() {
  currentMode.value = currentMode.value === 'normal' ? 'love' : 'normal'
}

function goHome() {
  router.push('/')
}

function recallMessage(id: string) {
  if (confirm('确定要撤回这条消息吗？')) {
    const index = appStore.chatHistory.findIndex(msg => msg.id === id)
    if (index > -1) {
      appStore.chatHistory.splice(index, 1)
    }
  }
}

function toggleSearch() {
  showSearch.value = !showSearch.value
  searchQuery.value = ''
}

function initVoiceRecognition() {
  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    recognition.value = new SpeechRecognition()
    recognition.value.lang = 'zh-CN'
    recognition.value.continuous = false
    recognition.value.interimResults = false

    recognition.value.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      inputMessage.value = transcript
    }

    recognition.value.onerror = () => {
      stopRecording()
    }

    recognition.value.onend = () => {
      stopRecording()
    }
  }
}

function startRecording() {
  if (!recognition.value) {
    initVoiceRecognition()
    if (!recognition.value) {
      alert('您的浏览器不支持语音输入')
      return
    }
  }

  isRecording.value = true
  recordingTime.value = 0
  
  recordingTimer = setInterval(() => {
    recordingTime.value++
  }, 1000)

  try {
    recognition.value.start()
  } catch {
    stopRecording()
  }
}

function stopRecording() {
  isRecording.value = false
  
  if (recordingTimer) {
    clearInterval(recordingTimer)
    recordingTimer = null
  }

  if (recognition.value) {
    try {
      recognition.value.stop()
    } catch {
    }
  }
}

function formatRecordingTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

onMounted(() => {
  scrollToBottom()
})
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-br from-primary-50 to-secondary-50">
    <header class="bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
      <button @click="goHome" class="p-2 rounded-full hover:bg-gray-100">
        <Home class="w-6 h-6 text-gray-600" />
      </button>
      <div class="flex items-center gap-2">
        <Heart class="w-6 h-6 text-primary-500 fill-primary-500" />
        <h1 class="text-lg font-bold text-gray-800">专属AI男友</h1>
      </div>
      <div class="flex items-center gap-2">
        <button
          @click="toggleSearch"
          class="p-2 rounded-full hover:bg-gray-100"
        >
          <Search class="w-5 h-5 text-gray-600" />
        </button>
        <button
          @click="toggleMode"
          class="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-all"
          :class="currentMode === 'love' ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-600'"
        >
          <Sparkles class="w-4 h-4" />
          {{ currentMode === 'love' ? '情话模式' : '普通模式' }}
        </button>
      </div>
    </header>

    <div v-if="showSearch" class="bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3">
      <div class="relative">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索聊天记录..."
          class="w-full bg-gray-100 rounded-xl pl-10 pr-4 py-2 border-none outline-none text-gray-800 placeholder-gray-400"
        />
        <button
          v-if="searchQuery"
          @click="searchQuery = ''"
          class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <RotateCcw class="w-4 h-4" />
        </button>
      </div>
    </div>

    <div ref="messagesContainer" class="flex-1 overflow-y-auto px-4 py-4 space-y-4">
      <div
        v-for="msg in displayedMessages"
        :key="msg.id"
        class="flex"
        :class="msg.role === 'user' ? 'justify-end' : 'justify-start'"
      >
        <div
          class="max-w-[80%] px-4 py-3 rounded-2xl relative group"
          :class="msg.role === 'user' ? 'bg-primary-500 text-white rounded-tr-sm' : 'bg-white text-gray-800 rounded-tl-sm shadow-sm'"
        >
          <p class="text-sm leading-relaxed whitespace-pre-wrap">{{ msg.content }}</p>
          <div class="flex items-center justify-between mt-1">
            <p class="text-xs opacity-60">{{ new Date(msg.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) }}</p>
            <button
              v-if="msg.role === 'user'"
              @click="recallMessage(msg.id)"
              class="opacity-0 group-hover:opacity-60 hover:opacity-100 transition-opacity text-xs ml-2"
            >
              撤回
            </button>
          </div>
        </div>
      </div>

      <div v-if="isLoading" class="flex justify-start">
        <div class="bg-white px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm">
          <div class="flex gap-1">
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
          </div>
        </div>
      </div>

      <div v-if="showSearch && !displayedMessages.length" class="text-center py-12">
        <Search class="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p class="text-gray-500">未找到相关消息</p>
      </div>
    </div>

    <div class="bg-white/80 backdrop-blur-md border-t border-gray-100 px-4 py-3">
      <div v-if="isRecording" class="flex items-center gap-4 mb-3">
        <div class="flex items-center gap-2">
          <div class="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center animate-pulse">
            <Mic class="w-5 h-5 text-white" />
          </div>
          <span class="text-gray-700 font-medium">{{ formatRecordingTime(recordingTime) }}</span>
        </div>
        <button
          @click="stopRecording"
          class="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-xl font-medium"
        >
          结束录音
        </button>
      </div>

      <div class="flex items-end gap-2">
        <button
          @click="isRecording ? stopRecording() : startRecording()"
          class="p-3 rounded-full transition-colors"
          :class="isRecording ? 'bg-red-100 text-red-500' : 'bg-gray-100 hover:bg-gray-200 text-gray-500'"
        >
          <MicOff v-if="isRecording" class="w-5 h-5" />
          <Mic v-else class="w-5 h-5" />
        </button>

        <div class="flex-1 bg-gray-100 rounded-2xl px-4 py-2">
          <input
            v-model="inputMessage"
            @keyup.enter="sendMessage"
            type="text"
            placeholder="想说什么呢..."
            class="w-full bg-transparent border-none outline-none text-gray-800 placeholder-gray-400"
          />
        </div>

        <button
          @click="generateLoveQuote"
          class="p-3 rounded-full bg-pink-100 hover:bg-pink-200 transition-colors"
        >
          <Heart class="w-5 h-5 text-pink-500" />
        </button>

        <button
          @click="sendMessage"
          :disabled="!inputMessage.trim() || isLoading"
          class="p-3 rounded-full bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white transition-colors"
        >
          <Send class="w-5 h-5" />
        </button>
      </div>
    </div>
  </div>
</template>
