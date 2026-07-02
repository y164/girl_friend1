<script setup lang="ts">
import { ref } from 'vue'
import { biologyQA, generateLessonPlan, generateExamQuestions } from '../api/ai'
import { BookOpen, FileText, HelpCircle, Send, Sparkles } from 'lucide-vue-next'

const currentTab = ref<'qa' | 'lesson' | 'exam'>('qa')
const inputQuestion = ref('')
const inputTopic = ref('')
const inputCount = ref(5)
const isLoading = ref(false)
const result = ref('')

const tabs = [
  { key: 'qa', label: '知识点问答', icon: HelpCircle },
  { key: 'lesson', label: '教案生成', icon: FileText },
  { key: 'exam', label: '试卷出题', icon: BookOpen }
]

async function handleQA() {
  if (!inputQuestion.value.trim() || isLoading.value) return
  
  isLoading.value = true
  result.value = ''
  
  try {
    result.value = await biologyQA(inputQuestion.value)
  } catch {
    result.value = '抱歉，暂时无法回答这个问题，请稍后再试。'
  } finally {
    isLoading.value = false
  }
}

async function handleLessonPlan() {
  if (!inputTopic.value.trim() || isLoading.value) return
  
  isLoading.value = true
  result.value = ''
  
  try {
    result.value = await generateLessonPlan(inputTopic.value)
  } catch {
    result.value = '抱歉，教案生成失败，请稍后再试。'
  } finally {
    isLoading.value = false
  }
}

async function handleExam() {
  if (!inputTopic.value.trim() || isLoading.value) return
  
  isLoading.value = true
  result.value = ''
  
  try {
    result.value = await generateExamQuestions(inputTopic.value, inputCount.value)
  } catch {
    result.value = '抱歉，试题生成失败，请稍后再试。'
  } finally {
    isLoading.value = false
  }
}

function formatResult(text: string): string {
  return text.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
}
</script>

<template>
  <div class="min-h-screen pb-20 px-4 pt-6 bg-gradient-to-br from-secondary-50 to-primary-50">
    <div class="max-w-md mx-auto">
      <div class="bg-white rounded-3xl p-6 shadow-lg mb-6">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-12 h-12 rounded-2xl bg-secondary-100 flex items-center justify-center">
            <BookOpen class="w-6 h-6 text-secondary-600" />
          </div>
          <div>
            <h1 class="text-xl font-bold text-gray-800">生物教学助手</h1>
            <p class="text-sm text-gray-500">专业支持，轻松备课</p>
          </div>
        </div>

        <div class="flex bg-gray-100 rounded-2xl p-1 mb-6">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            @click="currentTab = tab.key as 'qa' | 'lesson' | 'exam'"
            class="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all"
            :class="currentTab === tab.key ? 'bg-white text-secondary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
          >
            <component :is="tab.icon" class="w-4 h-4" />
            {{ tab.label }}
          </button>
        </div>

        <div v-if="currentTab === 'qa'" class="space-y-4">
          <div class="bg-gray-50 rounded-2xl p-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">输入问题</label>
            <textarea
              v-model="inputQuestion"
              @keyup.enter="handleQA"
              placeholder="例如：光合作用的过程是什么？DNA复制的特点有哪些？"
              rows="4"
              class="w-full bg-white rounded-xl px-4 py-3 border-none outline-none text-gray-800 placeholder-gray-400 resize-none"
            ></textarea>
          </div>
          <button
            @click="handleQA"
            :disabled="!inputQuestion.trim() || isLoading"
            class="w-full flex items-center justify-center gap-2 bg-secondary-500 hover:bg-secondary-600 disabled:bg-gray-300 text-white py-3.5 rounded-2xl font-medium transition-all"
          >
            <Sparkles class="w-5 h-5" />
            {{ isLoading ? '思考中...' : '开始解答' }}
          </button>
        </div>

        <div v-if="currentTab === 'lesson'" class="space-y-4">
          <div class="bg-gray-50 rounded-2xl p-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">教学主题</label>
            <input
              v-model="inputTopic"
              @keyup.enter="handleLessonPlan"
              type="text"
              placeholder="例如：细胞分裂、遗传定律、生态系统"
              class="w-full bg-white rounded-xl px-4 py-3 border-none outline-none text-gray-800 placeholder-gray-400"
            />
          </div>
          <button
            @click="handleLessonPlan"
            :disabled="!inputTopic.trim() || isLoading"
            class="w-full flex items-center justify-center gap-2 bg-secondary-500 hover:bg-secondary-600 disabled:bg-gray-300 text-white py-3.5 rounded-2xl font-medium transition-all"
          >
            <FileText class="w-5 h-5" />
            {{ isLoading ? '生成中...' : '生成教案' }}
          </button>
        </div>

        <div v-if="currentTab === 'exam'" class="space-y-4">
          <div class="bg-gray-50 rounded-2xl p-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">知识点</label>
            <input
              v-model="inputTopic"
              @keyup.enter="handleExam"
              type="text"
              placeholder="例如：细胞呼吸、减数分裂、基因表达"
              class="w-full bg-white rounded-xl px-4 py-3 border-none outline-none text-gray-800 placeholder-gray-400"
            />
          </div>
          <div class="bg-gray-50 rounded-2xl p-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">题目数量</label>
            <input
              v-model="inputCount"
              type="number"
              min="1"
              max="20"
              class="w-full bg-white rounded-xl px-4 py-3 border-none outline-none text-gray-800"
            />
          </div>
          <button
            @click="handleExam"
            :disabled="!inputTopic.trim() || isLoading"
            class="w-full flex items-center justify-center gap-2 bg-secondary-500 hover:bg-secondary-600 disabled:bg-gray-300 text-white py-3.5 rounded-2xl font-medium transition-all"
          >
            <Send class="w-5 h-5" />
            {{ isLoading ? '出题中...' : '生成试题' }}
          </button>
        </div>
      </div>

      <div v-if="result" class="bg-white rounded-3xl p-6 shadow-lg">
        <h2 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Sparkles class="w-5 h-5 text-secondary-500" />
          结果
        </h2>
        <div
          class="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap"
          v-html="formatResult(result)"
        ></div>
      </div>
    </div>
  </div>
</template>
