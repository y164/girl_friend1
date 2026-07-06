<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAppStore } from '../stores/app'
import { generateLoveStory, generateTestQuestion } from '../api/ai'
import { Heart, Sparkles, BookOpen, Trophy, RefreshCw } from 'lucide-vue-next'
import dayjs from 'dayjs'

const appStore = useAppStore()

const currentTab = ref<'test' | 'story'>('test')
const currentQuestionIndex = ref(0)
const answers = ref<number[]>([])
const testResult = ref('')
const isTestLoading = ref(false)
const isStoryLoading = ref(false)
const storyContent = ref('')
const storyDate = ref('')
const showStoryModal = ref(false)

interface Question {
  id: number
  question: string
  options: string[]
}

const questions = ref<Question[]>([])

const testProgress = computed(() => {
  return questions.value.length > 0 ? Math.round((currentQuestionIndex.value / questions.value.length) * 100) : 0
})

async function startTest() {
  isTestLoading.value = true
  currentQuestionIndex.value = 0
  answers.value = []
  testResult.value = ''
  
  try {
    const response = await generateTestQuestion()
    questions.value = JSON.parse(response.content)
  } catch {
    questions.value = [
      { id: 1, question: '你们第一次约会是在哪里？', options: ['餐厅', '公园', '电影院', '咖啡店'] },
      { id: 2, question: '她最喜欢的颜色是什么？', options: ['粉色', '蓝色', '白色', '紫色'] },
      { id: 3, question: '她的生日是哪一天？', options: ['一月', '六月', '十月', '十二月'] },
      { id: 4, question: '她最喜欢的食物是什么？', options: ['火锅', '西餐', '甜点', '日料'] },
      { id: 5, question: '你们在一起多久了？', options: ['不到一年', '一到两年', '两到五年', '五年以上'] }
    ]
  } finally {
    isTestLoading.value = false
  }
}

function selectAnswer(index: number) {
  answers.value[currentQuestionIndex.value] = index
  
  if (currentQuestionIndex.value < questions.value.length - 1) {
    currentQuestionIndex.value++
  } else {
    calculateResult()
  }
}

async function calculateResult() {
  isTestLoading.value = true
  
  try {
    const result = await generateLoveStory(`根据以下测试答案生成一个趣味恋爱测试结果：${JSON.stringify(answers.value)}`)
    testResult.value = result.content
  } catch {
    testResult.value = `🎉 恭喜你！你的恋爱默契度是 ${Math.floor(Math.random() * 30) + 70}%！\n\n你们的感情非常深厚，继续保持这份甜蜜吧！`
  } finally {
    isTestLoading.value = false
  }
}

async function generateStory() {
  if (!storyDate.value) return
  
  isStoryLoading.value = true
  
  try {
    const story = await generateLoveStory(`为以下日期生成一个浪漫的恋爱故事：${storyDate.value}，基于我们已经在一起${appStore.loveDays}天的背景`)
    storyContent.value = story.content
    showStoryModal.value = true
  } catch {
    storyContent.value = '在那个美好的日子里，我们一起度过了难忘的时光...'
    showStoryModal.value = true
  } finally {
    isStoryLoading.value = false
  }
}

function resetTest() {
  currentQuestionIndex.value = 0
  answers.value = []
  testResult.value = ''
  questions.value = []
}
</script>

<template>
  <div class="min-h-screen pb-20 px-4 pt-6 bg-gradient-to-br from-primary-50 to-secondary-50">
    <div class="max-w-md mx-auto">
      <div class="flex items-center gap-3 mb-6">
        <div class="w-12 h-12 rounded-2xl bg-primary-100 flex items-center justify-center">
          <Heart class="w-6 h-6 text-primary-600" />
        </div>
        <div>
          <h1 class="text-xl font-bold text-gray-800">恋爱关系</h1>
          <p class="text-sm text-gray-500">记录我们的甜蜜时光</p>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3 mb-6">
        <button
          @click="currentTab = 'test'"
          class="flex items-center gap-2 bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all"
          :class="currentTab === 'test' ? 'ring-2 ring-primary-500' : ''"
        >
          <div :class="currentTab === 'test' ? 'bg-primary-100' : 'bg-gray-100'" class="p-2 rounded-xl">
            <Trophy :class="currentTab === 'test' ? 'text-primary-600' : 'text-gray-600'" class="w-5 h-5" />
          </div>
          <span class="font-medium text-gray-700">恋爱测试</span>
        </button>
        <button
          @click="currentTab = 'story'"
          class="flex items-center gap-2 bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all"
          :class="currentTab === 'story' ? 'ring-2 ring-primary-500' : ''"
        >
          <div :class="currentTab === 'story' ? 'bg-primary-100' : 'bg-gray-100'" class="p-2 rounded-xl">
            <BookOpen :class="currentTab === 'story' ? 'text-primary-600' : 'text-gray-600'" class="w-5 h-5" />
          </div>
          <span class="font-medium text-gray-700">恋爱故事</span>
        </button>
      </div>

      <div v-if="currentTab === 'test'" class="space-y-4">
        <div v-if="!questions.length && !testResult" class="bg-white rounded-2xl p-5 shadow-sm text-center">
          <div class="w-20 h-20 mx-auto mb-4 rounded-full bg-primary-100 flex items-center justify-center">
            <Trophy class="w-10 h-10 text-primary-500" />
          </div>
          <h2 class="text-xl font-bold text-gray-800 mb-2">恋爱默契测试</h2>
          <p class="text-gray-500 mb-6">测试你对她的了解程度，看看你们的默契有多高！</p>
          <button
            @click="startTest"
            :disabled="isTestLoading"
            class="bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 text-white px-8 py-3 rounded-xl font-medium transition-all flex items-center gap-2 mx-auto"
          >
            <Sparkles class="w-5 h-5" />
            {{ isTestLoading ? '加载中...' : '开始测试' }}
          </button>
        </div>

        <div v-if="questions.length > 0 && !testResult" class="bg-white rounded-2xl p-5 shadow-sm">
          <div class="flex items-center justify-between mb-4">
            <span class="text-sm text-gray-500">第 {{ currentQuestionIndex + 1 }} / {{ questions.length }} 题</span>
            <span class="text-sm text-primary-500">{{ testProgress }}%</span>
          </div>
          
          <div class="h-2 bg-gray-100 rounded-full mb-6 overflow-hidden">
            <div
              class="h-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-300"
              :style="{ width: `${testProgress}%` }"
            ></div>
          </div>

          <h2 class="text-lg font-bold text-gray-800 mb-4">{{ questions[currentQuestionIndex]?.question }}</h2>
          
          <div class="space-y-3">
            <button
              v-for="(option, index) in questions[currentQuestionIndex]?.options"
              :key="index"
              @click="selectAnswer(index)"
              class="w-full text-left p-4 bg-gray-50 hover:bg-primary-50 rounded-xl transition-all border-2"
              :class="answers[currentQuestionIndex] === index ? 'border-primary-500 bg-primary-50' : 'border-transparent'"
            >
              <div class="flex items-center gap-3">
                <div
                  class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                  :class="answers[currentQuestionIndex] === index ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-600'"
                >
                  {{ String.fromCharCode(65 + Number(index)) }}
                </div>
                <span class="text-gray-700">{{ option }}</span>
              </div>
            </button>
          </div>
        </div>

        <div v-if="testResult" class="bg-white rounded-2xl p-5 shadow-sm">
          <div class="text-center mb-4">
            <div class="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
              <Heart class="w-10 h-10 text-white fill-white" />
            </div>
            <h2 class="text-xl font-bold text-gray-800">测试结果</h2>
          </div>
          
          <div class="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl p-4 mb-4">
            <p class="text-gray-700 leading-relaxed whitespace-pre-wrap">{{ testResult }}</p>
          </div>
          
          <button
            @click="resetTest"
            class="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw class="w-5 h-5" />
            再测一次
          </button>
        </div>
      </div>

      <div v-if="currentTab === 'story'" class="space-y-4">
        <div class="bg-white rounded-2xl p-5 shadow-sm">
          <h2 class="text-lg font-bold text-gray-800 mb-4">生成恋爱故事</h2>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">选择日期</label>
              <input
                v-model="storyDate"
                type="date"
                class="w-full bg-gray-50 rounded-xl px-4 py-3 border-none outline-none text-gray-800"
              />
            </div>
            
            <button
              @click="generateStory"
              :disabled="!storyDate || isStoryLoading"
              class="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 text-white py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
            >
              <Sparkles class="w-5 h-5" />
              {{ isStoryLoading ? '生成中...' : '生成故事' }}
            </button>
          </div>
        </div>

        <div class="bg-white rounded-2xl p-5 shadow-sm">
          <h2 class="text-lg font-bold text-gray-800 mb-4">恋爱时间线</h2>
          
          <div class="space-y-4">
            <div class="flex gap-4">
              <div class="flex flex-col items-center">
                <div class="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center">
                  <Heart class="w-5 h-5 text-white fill-white" />
                </div>
                <div class="w-0.5 flex-1 bg-gray-200"></div>
              </div>
              <div class="flex-1 pb-4">
                <div class="bg-gray-50 rounded-xl p-4">
                  <p class="text-sm text-gray-500">恋爱开始</p>
                  <p class="font-medium text-gray-800">我们在一起了！</p>
                  <p class="text-xs text-gray-400">{{ dayjs(appStore.startDate).format('YYYY年MM月DD日') }}</p>
                </div>
              </div>
            </div>
            
            <div class="flex gap-4">
              <div class="flex flex-col items-center">
                <div class="w-10 h-10 rounded-full bg-pink-400 flex items-center justify-center">
                  <Sparkles class="w-5 h-5 text-white" />
                </div>
                <div class="w-0.5 flex-1 bg-gray-200"></div>
              </div>
              <div class="flex-1 pb-4">
                <div class="bg-gray-50 rounded-xl p-4">
                  <p class="text-sm text-gray-500">第100天</p>
                  <p class="font-medium text-gray-800">百日纪念</p>
                  <p class="text-xs text-gray-400">{{ dayjs(appStore.startDate).add(100, 'day').format('YYYY年MM月DD日') }}</p>
                </div>
              </div>
            </div>
            
            <div class="flex gap-4">
              <div class="flex flex-col items-center">
                <div class="w-10 h-10 rounded-full bg-secondary-500 flex items-center justify-center">
                  <Heart class="w-5 h-5 text-white fill-white" />
                </div>
              </div>
              <div class="flex-1">
                <div class="bg-gray-50 rounded-xl p-4">
                  <p class="text-sm text-gray-500">今天</p>
                  <p class="font-medium text-gray-800">已在一起 {{ appStore.loveDays }} 天</p>
                  <p class="text-xs text-gray-400">{{ dayjs().format('YYYY年MM月DD日') }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="showStoryModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-3xl p-6 w-full max-w-sm max-h-[80vh] overflow-y-auto">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-bold text-gray-800">恋爱故事</h2>
            <button @click="showStoryModal = false" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div class="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl p-4 mb-4">
            <p class="text-sm text-gray-500 mb-2">{{ storyDate }}</p>
            <p class="text-gray-700 leading-relaxed whitespace-pre-wrap">{{ storyContent }}</p>
          </div>
          
          <button
            @click="showStoryModal = false"
            class="w-full bg-primary-500 hover:bg-primary-600 text-white py-3 rounded-xl font-medium transition-all"
          >
            保存回忆
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
