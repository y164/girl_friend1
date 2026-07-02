<script setup lang="ts">
import { ref } from 'vue'
import { useAppStore } from '../stores/app'
import { MapPin, Plus, Trash2, Camera, X, Heart, Save } from 'lucide-vue-next'

import dayjs from 'dayjs'

const appStore = useAppStore()

const showAddModal = ref(false)
const showDetailModal = ref(false)
const selectedSpot = ref<typeof appStore.travelSpots[0] | null>(null)

const searchKeyword = ref('')
const searchResults = ref<Array<{ name: string; city: string; province: string; country: string; lat: number; lng: number }>>([])
const isSearching = ref(false)

const newSpot = ref({
  name: '',
  city: '',
  province: '',
  country: '中国',
  lat: 0,
  lng: 0,
  visitDate: dayjs().format('YYYY-MM-DD'),
  description: ''
})
const fileInput = ref<HTMLInputElement | null>(null)
const AMAP_KEY = import.meta.env.VITE_AMAP_KEY

async function searchLocation() {
  if (!searchKeyword.value.trim()) return
  
  isSearching.value = true
  searchResults.value = []
  
  try {
    const response = await fetch(`https://restapi.amap.com/v3/geocode/geo?key=${AMAP_KEY}&address=${encodeURIComponent(searchKeyword.value)}`)
    const data = await response.json()
    
    if (data.status === '1' && data.geocodes && data.geocodes.length > 0) {
      const geocode = data.geocodes[0]
      searchResults.value = [{
        name: geocode.formatted_address || geocode.address,
        city: geocode.city || geocode.district || '',
        province: geocode.province || '',
        country: '中国',
        lat: parseFloat(geocode.location.split(',')[1]),
        lng: parseFloat(geocode.location.split(',')[0])
      }]
    }
    
    if (searchResults.value.length === 0) {
      const placeResponse = await fetch(`https://restapi.amap.com/v3/place/text?key=${AMAP_KEY}&keywords=${encodeURIComponent(searchKeyword.value)}&types=&city=&children=1&offset=5&page=1&extensions=all`)
      const placeData = await placeResponse.json()
      
      if (placeData.status === '1' && placeData.pois && placeData.pois.length > 0) {
        searchResults.value = placeData.pois.map((poi: any) => ({
          name: poi.name,
          city: poi.cityname || '',
          province: poi.adname || '',
          country: '中国',
          lat: parseFloat(poi.location.split(',')[1]),
          lng: parseFloat(poi.location.split(',')[0])
        }))
      }
    }
  } catch (e) {
    console.error('Search failed', e)
  } finally {
    isSearching.value = false
  }
}

function selectLocation(location: typeof searchResults.value[0]) {
  newSpot.value = {
    name: location.name,
    city: location.city,
    province: location.province,
    country: location.country,
    lat: location.lat,
    lng: location.lng,
    visitDate: newSpot.value.visitDate,
    description: newSpot.value.description
  }
  searchKeyword.value = ''
  searchResults.value = []
}

function saveSpot() {
  if (!newSpot.value.name.trim()) {
    alert('请输入地点名称')
    return
  }
  if (!newSpot.value.city.trim()) {
    alert('请输入城市')
    return
  }

  appStore.addTravelSpot({
    name: newSpot.value.name,
    city: newSpot.value.city,
    province: newSpot.value.province,
    country: newSpot.value.country,
    lat: newSpot.value.lat,
    lng: newSpot.value.lng,
    visitDate: newSpot.value.visitDate,
    description: newSpot.value.description,
    photos: []
  })
  
  resetForm()
  showAddModal.value = false
}

function resetForm() {
  newSpot.value = {
    name: '',
    city: '',
    province: '',
    country: '中国',
    lat: 0,
    lng: 0,
    visitDate: dayjs().format('YYYY-MM-DD'),
    description: ''
  }
  searchKeyword.value = ''
  searchResults.value = []
}

function deleteSpot(id: string) {
  if (confirm('确定要删除这个地点吗？')) {
    appStore.deleteTravelSpot(id)
    showDetailModal.value = false
  }
}

function triggerFileInput() {
  fileInput.value?.click()
}

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (file && selectedSpot.value) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const base64 = e.target?.result as string
      appStore.addPhotoToSpot(selectedSpot.value!.id, base64)
    }
    reader.readAsDataURL(file)
  }
  
  target.value = ''
}

function removePhoto(photoUrl: string) {
  if (selectedSpot.value && confirm('确定要删除这张照片吗？')) {
    appStore.removePhotoFromSpot(selectedSpot.value.id, photoUrl)
  }
}

function formatDate(date: string): string {
  return dayjs(date).format('YYYY年MM月DD日')
}
</script>

<template>
  <div class="min-h-screen pb-20 px-4 pt-6 bg-gradient-to-br from-primary-50 to-secondary-50">
    <div class="max-w-md mx-auto">
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-primary-100 flex items-center justify-center">
            <MapPin class="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 class="text-xl font-bold text-gray-800">我们的足迹</h1>
            <p class="text-sm text-gray-500">已点亮 {{ appStore.travelSpots.length }} 个地点，{{ appStore.visitedProvinces }} 个省份</p>
          </div>
        </div>
        <button
          @click="showAddModal = true"
          class="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-xl font-medium transition-all"
        >
          <Plus class="w-5 h-5" />
          添加地点
        </button>
      </div>
      <div class="bg-white rounded-2xl p-5 shadow-sm">
        <h2 class="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Heart class="w-5 h-5 text-primary-500" />
          足迹列表
        </h2>
        <div v-if="appStore.travelSpots.length === 0" class="text-center py-8">
          <p class="text-gray-500 mb-3">还没有去过任何地方</p>
          <button @click="showAddModal = true" class="bg-primary-500 text-white px-6 py-2 rounded-full text-sm font-medium">
            添加第一个地点
          </button>
        </div>
        <div v-else class="space-y-3">
          <div
            v-for="spot in appStore.travelSpots"
            :key="spot.id"
            @click="selectedSpot = spot; showDetailModal = true"
            class="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors"
          >
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                <MapPin class="w-5 h-5 text-primary-500" />
              </div>
              <div>
                <p class="font-medium text-gray-800">{{ spot.name }}</p>
                <p class="text-xs text-gray-500">{{ spot.province }} {{ spot.city }} · {{ formatDate(spot.visitDate) }}</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <span v-if="spot.photos.length > 0" class="text-xs text-gray-400">{{ spot.photos.length }}张照片</span>
              <button
                @click.stop="deleteSpot(spot.id)"
                class="p-2 rounded-full hover:bg-red-100 text-gray-400 hover:text-red-500 transition-colors"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showAddModal" class="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
      <div class="bg-white rounded-t-3xl sm:rounded-3xl p-6 w-full sm:max-w-sm max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-bold text-gray-800">添加新地点</h2>
          <button @click="showAddModal = false" class="text-gray-400 hover:text-gray-600">
            <X class="w-6 h-6" />
          </button>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">搜索地点</label>
            <div class="relative">
              <input
                v-model="searchKeyword"
                type="text"
                placeholder="输入城市或景点名称"
                class="w-full bg-gray-50 rounded-xl px-4 py-3 border-none outline-none text-gray-800 placeholder-gray-400 pr-12"
                @keyup.enter="searchLocation"
              />
              <button
                @click="searchLocation"
                :disabled="!searchKeyword.trim() || isSearching"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-primary-500 hover:text-primary-600 disabled:text-gray-400"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>

          <div v-if="searchResults.length > 0" class="space-y-2">
            <button
              v-for="location in searchResults"
              :key="`${location.lat}-${location.lng}`"
              @click="selectLocation(location)"
              class="w-full text-left p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors border border-primary-200"
            >
              <p class="font-medium text-gray-800">{{ location.name }}</p>
              <p class="text-xs text-gray-500">{{ location.province }} {{ location.city }}</p>
            </button>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">地点名称 *</label>
            <input
              v-model="newSpot.name"
              type="text"
              placeholder="输入地点名称"
              class="w-full bg-gray-50 rounded-xl px-4 py-3 border-none outline-none text-gray-800 placeholder-gray-400"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">城市 *</label>
            <input
              v-model="newSpot.city"
              type="text"
              placeholder="输入城市名称"
              class="w-full bg-gray-50 rounded-xl px-4 py-3 border-none outline-none text-gray-800 placeholder-gray-400"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">省份 *</label>
            <input
              v-model="newSpot.province"
              type="text"
              placeholder="输入省份名称"
              class="w-full bg-gray-50 rounded-xl px-4 py-3 border-none outline-none text-gray-800 placeholder-gray-400"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">访问日期 *</label>
            <input
              v-model="newSpot.visitDate"
              type="date"
              class="w-full bg-gray-50 rounded-xl px-4 py-3 border-none outline-none text-gray-800"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">备注（可选）</label>
            <textarea
              v-model="newSpot.description"
              placeholder="记录一下当时的心情..."
              rows="3"
              class="w-full bg-gray-50 rounded-xl px-4 py-3 border-none outline-none text-gray-800 placeholder-gray-400 resize-none"
            ></textarea>
          </div>
        </div>

        <div class="flex gap-3 mt-6">
          <button
            @click="showAddModal = false"
            class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-medium transition-all"
          >
            取消
          </button>
          <button
            @click="saveSpot"
            class="flex-1 bg-primary-500 hover:bg-primary-600 text-white py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
          >
            <Save class="w-5 h-5" />
            保存
          </button>
        </div>
      </div>
    </div>

    <div v-if="showDetailModal && selectedSpot" class="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
      <div class="bg-white rounded-t-3xl sm:rounded-3xl p-6 w-full sm:max-w-sm max-h-[80vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="text-xl font-bold text-gray-800">{{ selectedSpot.name }}</h2>
            <p class="text-sm text-gray-500">{{ selectedSpot.province }} {{ selectedSpot.city }}</p>
          </div>
          <div class="flex items-center gap-2">
            <button
              @click="deleteSpot(selectedSpot.id)"
              class="p-2 rounded-full hover:bg-red-100 text-gray-400 hover:text-red-500 transition-colors"
            >
              <Trash2 class="w-5 h-5" />
            </button>
            <button @click="showDetailModal = false" class="text-gray-400 hover:text-gray-600">
              <X class="w-6 h-6" />
            </button>
          </div>
        </div>

        <div class="space-y-4">
          <div class="bg-gray-50 rounded-xl p-4">
            <div class="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              访问日期
            </div>
            <p class="font-medium text-gray-800">{{ formatDate(selectedSpot.visitDate) }}</p>
          </div>

          <div v-if="selectedSpot.description" class="bg-gray-50 rounded-xl p-4">
            <div class="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <svg class="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              备注
            </div>
            <p class="text-gray-800">{{ selectedSpot.description }}</p>
          </div>

          <div>
            <div class="flex items-center justify-between mb-3">
              <h3 class="font-medium text-gray-800">照片</h3>
              <button
                @click="triggerFileInput"
                class="flex items-center gap-1 text-sm text-primary-500 hover:text-primary-600"
              >
                <Camera class="w-4 h-4" />
                添加照片
              </button>
            </div>
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              class="hidden"
              @change="handleFileSelect"
            />
            
            <div v-if="selectedSpot.photos.length === 0" class="bg-gray-50 rounded-xl p-6 text-center">
              <Camera class="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p class="text-sm text-gray-500">还没有照片</p>
            </div>
            <div v-else class="grid grid-cols-3 gap-2">
              <div
                v-for="(photo, index) in selectedSpot.photos"
                :key="index"
                class="relative aspect-square bg-gray-100 rounded-xl overflow-hidden"
              >
                <img :src="photo" alt="照片" class="w-full h-full object-cover" />
                <button
                  @click="removePhoto(photo)"
                  class="absolute top-1 right-1 p-1 bg-black/50 rounded-full text-white hover:bg-black/70"
                >
                  <X class="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>