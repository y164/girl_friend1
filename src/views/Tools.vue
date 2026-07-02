<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAppStore } from '../stores/app'
import { Cloud, Sun, CloudRain, Wind, Calendar, Clock, Plus, Trash2, Bell, X, AlertCircle } from 'lucide-vue-next'
import dayjs from 'dayjs'

const appStore = useAppStore()

const currentTab = ref<'weather' | 'schedule'>('weather')
const city = ref('北京')
const weatherData = ref<any>(null)
const isWeatherLoading = ref(false)
const showAddScheduleModal = ref(false)
const showNotification = ref(false)

const newSchedule = ref({
  title: '',
  date: '',
  time: '',
  reminder: 15,
  note: ''
})

const upcomingSchedules = computed(() => {
  return appStore.schedules
    .filter(s => dayjs(`${s.date} ${s.time}`).isAfter(dayjs()))
    .sort((a, b) => dayjs(`${a.date} ${a.time}`).valueOf() - dayjs(`${b.date} ${b.time}`).valueOf())
})

async function fetchWeather() {
  isWeatherLoading.value = true
  
  try {
    const amapKey = import.meta.env.VITE_AMAP_KEY
    const response = await fetch(`https://restapi.amap.com/v3/weather/weatherInfo?key=${amapKey}&city=${encodeURIComponent(city.value)}&extensions=all`)
    
    if (response.ok) {
      const data = await response.json()
      if (data.status === '1' && data.lives && data.lives.length > 0) {
        const weather = data.lives[0]
        weatherData.value = {
          city: weather.city,
          temp: parseInt(weather.temperature),
          feels_like: parseInt(weather.temperature),
          description: weather.weather,
          humidity: parseInt(weather.humidity),
          wind: weather.winddirection + weather.windpower,
          icon: weather.weather
        }
      } else {
        throw new Error('No weather data')
      }
    } else {
      throw new Error('API error')
    }
  } catch {
    weatherData.value = {
      city: city.value,
      temp: 25,
      feels_like: 24,
      description: '晴',
      humidity: 60,
      wind: '微风',
      icon: '晴'
    }
  } finally {
    isWeatherLoading.value = false
  }
}

function addSchedule() {
  if (!newSchedule.value.title || !newSchedule.value.date || !newSchedule.value.time) {
    alert('请填写完整信息')
    return
  }
  
  appStore.addSchedule({
    title: newSchedule.value.title,
    date: newSchedule.value.date,
    time: newSchedule.value.time,
    reminder: newSchedule.value.reminder,
    note: newSchedule.value.note,
    completed: false
  })
  
  newSchedule.value = {
    title: '',
    date: '',
    time: '',
    reminder: 15,
    note: ''
  }
  
  showAddScheduleModal.value = false
}

function deleteSchedule(id: string) {
  if (confirm('确定要删除这个日程吗？')) {
    appStore.deleteSchedule(id)
  }
}

function formatTime(date: string, time: string): string {
  return dayjs(`${date} ${time}`).format('MM月DD日 HH:mm')
}

function getTimeUntil(date: string, time: string): string {
  const diff = dayjs(`${date} ${time}`).diff(dayjs())
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  
  if (hours > 0) {
    return `${hours}小时${minutes}分钟后`
  } else {
    return `${minutes}分钟后`
  }
}

onMounted(() => {
  fetchWeather()
  
  setInterval(() => {
    upcomingSchedules.value.forEach(schedule => {
      const diff = dayjs(`${schedule.date} ${schedule.time}`).diff(dayjs())
      const minutes = Math.floor(diff / (1000 * 60))
      
      if (minutes === schedule.reminder && !schedule.completed) {
        showNotification.value = true
      }
    })
  }, 60000)
})
</script>

<template>
  <div class="min-h-screen pb-20 px-4 pt-6 bg-gradient-to-br from-primary-50 to-secondary-50">
    <div class="max-w-md mx-auto">
      <div class="flex items-center gap-3 mb-6">
        <div class="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center">
          <Bell class="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h1 class="text-xl font-bold text-gray-800">实用工具</h1>
          <p class="text-sm text-gray-500">天气和日程管理</p>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3 mb-6">
        <button
          @click="currentTab = 'weather'"
          class="flex items-center gap-2 bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all"
          :class="currentTab === 'weather' ? 'ring-2 ring-blue-500' : ''"
        >
          <div :class="currentTab === 'weather' ? 'bg-blue-100' : 'bg-gray-100'" class="p-2 rounded-xl">
            <Cloud :class="currentTab === 'weather' ? 'text-blue-600' : 'text-gray-600'" class="w-5 h-5" />
          </div>
          <span class="font-medium text-gray-700">天气查询</span>
        </button>
        <button
          @click="currentTab = 'schedule'"
          class="flex items-center gap-2 bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all"
          :class="currentTab === 'schedule' ? 'ring-2 ring-blue-500' : ''"
        >
          <div :class="currentTab === 'schedule' ? 'bg-blue-100' : 'bg-gray-100'" class="p-2 rounded-xl">
            <Calendar :class="currentTab === 'schedule' ? 'text-blue-600' : 'text-gray-600'" class="w-5 h-5" />
          </div>
          <span class="font-medium text-gray-700">日程提醒</span>
        </button>
      </div>

      <div v-if="currentTab === 'weather'" class="space-y-4">
        <div class="bg-white rounded-2xl p-4 shadow-sm">
          <div class="flex items-center gap-3">
            <input
              v-model="city"
              @keyup.enter="fetchWeather"
              type="text"
              placeholder="输入城市名称"
              class="flex-1 bg-gray-50 rounded-xl px-4 py-3 border-none outline-none text-gray-800 placeholder-gray-400"
            />
            <button
              @click="fetchWeather"
              :disabled="isWeatherLoading"
              class="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-4 py-3 rounded-xl font-medium transition-all"
            >
              查询
            </button>
          </div>
        </div>

        <div v-if="weatherData" class="bg-gradient-to-br from-blue-400 to-blue-600 rounded-3xl p-6 shadow-lg text-white">
          <div class="flex items-center justify-between mb-6">
            <div>
              <p class="text-blue-100 text-sm">{{ weatherData.city }}</p>
              <p class="text-3xl font-bold">{{ weatherData.temp }}°C</p>
              <p class="text-blue-100 text-sm mt-1">{{ weatherData.description }}</p>
            </div>
            <div class="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <Sun class="w-8 h-8" />
            </div>
          </div>
          
          <div class="grid grid-cols-3 gap-4">
            <div class="text-center">
              <CloudRain class="w-5 h-5 mx-auto mb-1 opacity-80" />
              <p class="text-xs opacity-80">湿度</p>
              <p class="font-medium">{{ weatherData.humidity }}%</p>
            </div>
            <div class="text-center">
              <Wind class="w-5 h-5 mx-auto mb-1 opacity-80" />
              <p class="text-xs opacity-80">风速</p>
              <p class="font-medium">{{ weatherData.wind }}m/s</p>
            </div>
            <div class="text-center">
              <Sun class="w-5 h-5 mx-auto mb-1 opacity-80" />
              <p class="text-xs opacity-80">体感</p>
              <p class="font-medium">{{ weatherData.feels_like }}°C</p>
            </div>
          </div>
        </div>

        <div v-if="isWeatherLoading" class="bg-white rounded-3xl p-12 shadow-sm text-center">
          <div class="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p class="text-gray-500">正在获取天气信息...</p>
        </div>
      </div>

      <div v-if="currentTab === 'schedule'" class="space-y-4">
        <button
          @click="showAddScheduleModal = true"
          class="w-full bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 text-primary-500"
        >
          <Plus class="w-5 h-5" />
          添加新日程
        </button>

        <div v-if="upcomingSchedules.length === 0" class="bg-white rounded-3xl p-12 shadow-sm text-center">
          <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar class="w-10 h-10 text-gray-400" />
          </div>
          <h3 class="text-lg font-bold text-gray-800 mb-2">还没有日程</h3>
          <p class="text-gray-500">添加一个新的日程提醒吧！</p>
        </div>

        <div v-for="schedule in upcomingSchedules" :key="schedule.id" class="bg-white rounded-2xl p-4 shadow-sm">
          <div class="flex items-start justify-between mb-2">
            <h3 class="font-bold text-gray-800">{{ schedule.title }}</h3>
            <button @click="deleteSchedule(schedule.id)" class="text-gray-400 hover:text-red-500">
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
          
          <div class="flex items-center gap-4 text-sm text-gray-500 mb-2">
            <div class="flex items-center gap-1">
              <Calendar class="w-4 h-4" />
              <span>{{ formatTime(schedule.date, schedule.time) }}</span>
            </div>
            <div class="flex items-center gap-1">
              <Clock class="w-4 h-4" />
              <span class="text-primary-500">{{ getTimeUntil(schedule.date, schedule.time) }}</span>
            </div>
          </div>
          
          <div v-if="schedule.note" class="bg-gray-50 rounded-xl p-3">
            <p class="text-sm text-gray-600">{{ schedule.note }}</p>
          </div>
          
          <div v-if="schedule.reminder > 0" class="flex items-center gap-1 mt-2 text-xs text-gray-400">
            <Bell class="w-3 h-3" />
            <span>提前{{ schedule.reminder }}分钟提醒</span>
          </div>
        </div>
      </div>

      <div v-if="showAddScheduleModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
        <div class="bg-white rounded-3xl p-6 w-full max-w-sm">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-bold text-gray-800">添加日程</h2>
            <button @click="showAddScheduleModal = false" class="text-gray-400 hover:text-gray-600">
              <X class="w-6 h-6" />
            </button>
          </div>
          
          <div class="space-y-4 mb-6">
            <input
              v-model="newSchedule.title"
              type="text"
              placeholder="日程标题"
              class="w-full bg-gray-50 rounded-xl px-4 py-3 border-none outline-none text-gray-800 placeholder-gray-400"
            />
            
            <div class="grid grid-cols-2 gap-3">
              <input
                v-model="newSchedule.date"
                type="date"
                class="w-full bg-gray-50 rounded-xl px-4 py-3 border-none outline-none text-gray-800"
              />
              <input
                v-model="newSchedule.time"
                type="time"
                class="w-full bg-gray-50 rounded-xl px-4 py-3 border-none outline-none text-gray-800"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">提醒时间</label>
              <select
                v-model="newSchedule.reminder"
                class="w-full bg-gray-50 rounded-xl px-4 py-3 border-none outline-none text-gray-800"
              >
                <option :value="0">不提醒</option>
                <option :value="5">提前5分钟</option>
                <option :value="15">提前15分钟</option>
                <option :value="30">提前30分钟</option>
                <option :value="60">提前1小时</option>
              </select>
            </div>
            
            <textarea
              v-model="newSchedule.note"
              placeholder="备注（可选）"
              rows="3"
              class="w-full bg-gray-50 rounded-xl px-4 py-3 border-none outline-none text-gray-800 placeholder-gray-400 resize-none"
            ></textarea>
          </div>
          
          <button
            @click="addSchedule"
            class="w-full bg-primary-500 hover:bg-primary-600 text-white py-3 rounded-xl font-medium transition-all"
          >
            保存日程
          </button>
        </div>
      </div>

      <div v-if="showNotification" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
        <div class="bg-white rounded-3xl p-6 w-full max-w-sm text-center">
          <div class="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle class="w-8 h-8 text-primary-500" />
          </div>
          <h2 class="text-xl font-bold text-gray-800 mb-2">日程提醒</h2>
          <p class="text-gray-500 mb-6">您有一个即将到来的日程！</p>
          <button
            @click="showNotification = false"
            class="w-full bg-primary-500 hover:bg-primary-600 text-white py-3 rounded-xl font-medium transition-all"
          >
            知道了
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
