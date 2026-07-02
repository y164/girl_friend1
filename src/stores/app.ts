import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import dayjs from 'dayjs'

export interface DiaryEntry {
  id: string
  date: string
  mood: 'happy' | 'sad' | 'angry' | 'anxious' | 'calm' | 'excited'
  content: string
  aiSummary: string
}

export interface Anniversary {
  id: string
  name: string
  date: string
  type: 'birthday' | 'anniversary' | 'other'
}

export interface GiftItem {
  id: string
  name: string
  description: string
  price: string
  category: string
  status: 'wishlist' | 'purchased' | 'received'
  link?: string
  notes?: string
}

export interface Schedule {
  id: string
  title: string
  date: string
  time: string
  reminder: number
  note: string
  completed: boolean
}

export interface HealthRecord {
  id: string
  date: string
  water: number
  steps: number
  sleep: number
  exercise: boolean
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface Photo {
  id: string
  url: string
  date: string
  description: string
  tags: string[]
}

export interface TravelSpot {
  id: string
  name: string
  city: string
  province: string
  country: string
  lat: number
  lng: number
  visitDate: string
  description: string
  photos: string[]
}

export const useAppStore = defineStore('app', () => {
  const startDate = ref('2024-01-01')
  const anniversaryList = ref<Anniversary[]>([
    { id: '1', name: '恋爱纪念日', date: '2024-01-01', type: 'anniversary' },
    { id: '2', name: '她的生日', date: '2000-06-15', type: 'birthday' },
    { id: '3', name: '情人节', date: '2026-02-14', type: 'other' },
    { id: '4', name: '七夕', date: '2026-08-29', type: 'other' },
    { id: '5', name: '在一起100天', date: '2024-04-10', type: 'anniversary' },
    { id: '6', name: '在一起520天', date: '2025-06-05', type: 'anniversary' },
    { id: '7', name: '在一起1000天', date: '2026-08-27', type: 'anniversary' },
    { id: '8', name: '圣诞节', date: '2026-12-25', type: 'other' },
    { id: '9', name: '新年', date: '2027-01-01', type: 'other' },
    { id: '10', name: '白色情人节', date: '2026-03-14', type: 'other' }
  ])

  const diaryList = ref<DiaryEntry[]>([])
  const healthRecords = ref<HealthRecord[]>([])
  const chatHistory = ref<ChatMessage[]>([])
  const dailyQuote = ref('')
  const photos = ref<Photo[]>([])
  const giftList = ref<GiftItem[]>([])
  const schedules = ref<Schedule[]>([])
  const travelSpots = ref<TravelSpot[]>([
    { id: '1', name: '天安门广场', city: '北京', province: '北京', country: '中国', lat: 39.9042, lng: 116.4074, visitDate: '2024-03-15', description: '第一次带宝贝来北京', photos: [] },
    { id: '2', name: '外滩', city: '上海', province: '上海', country: '中国', lat: 31.2304, lng: 121.4737, visitDate: '2024-05-20', description: '浪漫的上海之旅', photos: [] },
    { id: '3', name: '宽窄巷子', city: '成都', province: '四川', country: '中国', lat: 30.6636, lng: 104.0338, visitDate: '2024-07-10', description: '吃火锅啦', photos: [] }
  ])

  const loveDays = computed(() => {
    return dayjs().diff(dayjs(startDate.value), 'day')
  })

  const nextAnniversary = computed<{ anniversary: Anniversary | null; days: number }>(() => {
    const now = dayjs()
    let minDiff = Infinity
    let next: Anniversary | null = null

    anniversaryList.value.forEach(item => {
      let targetDate = dayjs(item.date)
      if (targetDate.isBefore(now)) {
        targetDate = targetDate.add(1, 'year')
      }
      const diff = targetDate.diff(now, 'day')
      if (diff < minDiff) {
        minDiff = diff
        next = item
      }
    })

    return {
      anniversary: next,
      days: minDiff
    }
  })

  const todayHealth = computed(() => {
    const today = dayjs().format('YYYY-MM-DD')
    return healthRecords.value.find(r => r.date === today) || null
  })

  function addDiary(entry: Omit<DiaryEntry, 'id'>) {
    const newEntry: DiaryEntry = {
      ...entry,
      id: Date.now().toString()
    }
    diaryList.value.unshift(newEntry)
    saveData()
  }

  function addHealthRecord(record: Omit<HealthRecord, 'id'>) {
    const existing = healthRecords.value.find(r => r.date === record.date)
    if (existing) {
      Object.assign(existing, record)
    } else {
      healthRecords.value.push({
        ...record,
        id: Date.now().toString()
      })
    }
    saveData()
  }

  function addAnniversary(anniversary: Omit<Anniversary, 'id'>) {
    anniversaryList.value.push({
      ...anniversary,
      id: Date.now().toString()
    })
    saveData()
  }

  function deleteAnniversary(id: string) {
    anniversaryList.value = anniversaryList.value.filter(item => item.id !== id)
    saveData()
  }

  function addPhoto(photo: Omit<Photo, 'id'>) {
    photos.value.unshift({
      ...photo,
      id: Date.now().toString()
    })
    saveData()
  }

  function deletePhoto(id: string) {
    photos.value = photos.value.filter(item => item.id !== id)
    saveData()
  }

  function addTravelSpot(spot: Omit<TravelSpot, 'id'>) {
    travelSpots.value.push({
      ...spot,
      id: Date.now().toString()
    })
    saveData()
  }

  function deleteTravelSpot(id: string) {
    travelSpots.value = travelSpots.value.filter(item => item.id !== id)
    saveData()
  }

  function addPhotoToSpot(spotId: string, photoUrl: string) {
    const spot = travelSpots.value.find(s => s.id === spotId)
    if (spot) {
      spot.photos.push(photoUrl)
      saveData()
    }
  }

  function removePhotoFromSpot(spotId: string, photoUrl: string) {
    const spot = travelSpots.value.find(s => s.id === spotId)
    if (spot) {
      spot.photos = spot.photos.filter(p => p !== photoUrl)
      saveData()
    }
  }

  function addGift(gift: Omit<GiftItem, 'id'>) {
    giftList.value.push({
      ...gift,
      id: Date.now().toString()
    })
    saveData()
  }

  function deleteGift(id: string) {
    giftList.value = giftList.value.filter(g => g.id !== id)
    saveData()
  }

  function updateGiftStatus(id: string, status: GiftItem['status']) {
    const gift = giftList.value.find(g => g.id === id)
    if (gift) {
      gift.status = status
      saveData()
    }
  }

  function addSchedule(schedule: Omit<Schedule, 'id'>) {
    schedules.value.push({
      ...schedule,
      id: Date.now().toString()
    })
    saveData()
  }

  function deleteSchedule(id: string) {
    schedules.value = schedules.value.filter(s => s.id !== id)
    saveData()
  }

  const visitedProvinces = computed(() => {
    const provinces = new Set(travelSpots.value.map(s => s.province))
    return provinces.size
  })

  const visitedProvincesList = computed(() => {
    const provinces = new Set(travelSpots.value.map(s => s.province))
    return Array.from(provinces)
  })

  function addChatMessage(message: Omit<ChatMessage, 'id'>) {
    chatHistory.value.push({
      ...message,
      id: Date.now().toString()
    })
    saveData()
  }

  function clearChatHistory() {
    chatHistory.value = []
    saveData()
  }

  function setDailyQuote(quote: string) {
    dailyQuote.value = quote
    localStorage.setItem('dailyQuote', quote)
  }

  function saveData() {
    const data = {
      startDate: startDate.value,
      anniversaryList: anniversaryList.value,
      diaryList: diaryList.value,
      healthRecords: healthRecords.value,
      chatHistory: chatHistory.value,
      photos: photos.value,
      travelSpots: travelSpots.value,
      giftList: giftList.value,
      schedules: schedules.value
    }
    localStorage.setItem('appData', JSON.stringify(data))
  }

  function loadData() {
    const data = localStorage.getItem('appData')
    if (data) {
      try {
        const parsed = JSON.parse(data)
        startDate.value = parsed.startDate || '2024-01-01'
        anniversaryList.value = parsed.anniversaryList || []
        diaryList.value = parsed.diaryList || []
        healthRecords.value = parsed.healthRecords || []
        chatHistory.value = parsed.chatHistory || []
        photos.value = parsed.photos || []
        travelSpots.value = parsed.travelSpots || []
        giftList.value = parsed.giftList || []
        schedules.value = parsed.schedules || []
      } catch {
        console.error('Failed to load data')
      }
    }

    const savedQuote = localStorage.getItem('dailyQuote')
    const savedDate = localStorage.getItem('quoteDate')
    
    if (savedQuote && savedDate === dayjs().format('YYYY-MM-DD')) {
      dailyQuote.value = savedQuote
    } else {
      dailyQuote.value = generateDailyQuote()
      localStorage.setItem('dailyQuote', dailyQuote.value)
      localStorage.setItem('quoteDate', dayjs().format('YYYY-MM-DD'))
    }
  }

  function generateDailyQuote(): string {
    const quotes = [
      '今天也是爱你的一天，宝贝！',
      '早安，我的小仙女，愿你今天心情美美哒！',
      '无论发生什么，我都会一直在你身边。',
      '你的笑容是我每天最大的动力，爱你！',
      '想你了，每分每秒都想和你在一起。',
      '愿你的每一天都充满阳光和温暖。',
      '你是我生命中最美的风景，永远爱你！',
      '早安，新的一天，新的爱你的理由。',
      '有你在身边，每一天都是情人节。',
      '你的幸福就是我最大的幸福，宝贝！',
      '今天也要元气满满哦，我在背后支持你！',
      '遇见你是我这辈子最幸运的事。',
      '无论多远，我的心永远和你在一起。',
      '你是我的唯一，永远不变的挚爱。',
      '愿今天的你，被温柔以待。'
    ]
    return quotes[Math.floor(Math.random() * quotes.length)]
  }

  return {
    startDate,
    anniversaryList,
    diaryList,
    healthRecords,
    chatHistory,
    photos,
    travelSpots,
    giftList,
    schedules,
    dailyQuote,
    loveDays,
    nextAnniversary,
    todayHealth,
    visitedProvinces,
    visitedProvincesList,
    addDiary,
    addHealthRecord,
    addAnniversary,
    deleteAnniversary,
    addPhoto,
    deletePhoto,
    addTravelSpot,
    deleteTravelSpot,
    addPhotoToSpot,
    removePhotoFromSpot,
    addGift,
    deleteGift,
    updateGiftStatus,
    addSchedule,
    deleteSchedule,
    addChatMessage,
    clearChatHistory,
    setDailyQuote,
    saveData,
    loadData
  }
})
