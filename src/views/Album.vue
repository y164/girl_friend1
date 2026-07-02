<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAppStore } from '../stores/app'
import { ImagePlus, Trash2, X, Heart, Sparkles, Calendar, MapPin, Star } from 'lucide-vue-next'
import dayjs from 'dayjs'

const appStore = useAppStore()

const showUploadModal = ref(false)
const showPreviewModal = ref(false)
const selectedPhoto = ref<typeof appStore.photos[0] | null>(null)
const newPhotoDescription = ref('')
const newPhotoTags = ref('')
const fileInput = ref<HTMLInputElement | null>(null)
const selectedCategory = ref('all')
const isBeautifying = ref(false)

const categories = [
  { id: 'all', name: '全部', icon: ImagePlus },
  { id: 'date', name: '按日期', icon: Calendar },
  { id: 'location', name: '按地点', icon: MapPin },
  { id: 'tag', name: '按标签', icon: Star }
]

const photosByDate = computed(() => {
  const grouped: Record<string, typeof appStore.photos> = {}
  appStore.photos.forEach(photo => {
    const date = dayjs(photo.date).format('YYYY年MM月')
    if (!grouped[date]) grouped[date] = []
    grouped[date].push(photo)
  })
  return grouped
})

const photosByTag = computed(() => {
  const grouped: Record<string, typeof appStore.photos> = {}
  appStore.photos.forEach(photo => {
    photo.tags.forEach(tag => {
      if (!grouped[tag]) grouped[tag] = []
      grouped[tag].push(photo)
    })
  })
  return grouped
})

function triggerFileInput() {
  fileInput.value?.click()
}

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const base64 = e.target?.result as string
      appStore.addPhoto({
        url: base64,
        date: dayjs().format('YYYY-MM-DD'),
        description: newPhotoDescription.value,
        tags: newPhotoTags.value.split(',').map(t => t.trim()).filter(t => t)
      })
      newPhotoDescription.value = ''
      newPhotoTags.value = ''
      showUploadModal.value = false
    }
    reader.readAsDataURL(file)
  }
  target.value = ''
}

function openPreview(photo: typeof appStore.photos[0]) {
  selectedPhoto.value = photo
  showPreviewModal.value = true
}

function closePreview() {
  showPreviewModal.value = false
  selectedPhoto.value = null
}

function deletePhoto(id: string) {
  if (confirm('确定要删除这张照片吗？')) {
    appStore.deletePhoto(id)
    closePreview()
  }
}

function formatDate(date: string): string {
  return dayjs(date).format('YYYY年MM月DD日')
}

async function beautifyPhoto() {
  if (!selectedPhoto.value) return
  
  isBeautifying.value = true
  
  try {
    const canvas = document.createElement('canvas')
    const img = new Image()
    img.crossOrigin = 'anonymous'
    
    await new Promise((resolve, reject) => {
      img.onload = resolve
      img.onerror = reject
      img.src = selectedPhoto.value!.url
    })
    
    canvas.width = img.width
    canvas.height = img.height
    const ctx = canvas.getContext('2d')
    
    if (ctx) {
      ctx.filter = 'brightness(1.1) contrast(1.1) saturate(1.1)'
      ctx.drawImage(img, 0, 0)
      
      ctx.save()
      ctx.globalCompositeOperation = 'overlay'
      ctx.fillStyle = 'rgba(255, 182, 193, 0.1)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.restore()
      
      const beautifiedUrl = canvas.toDataURL('image/jpeg', 0.9)
      
      const photoIndex = appStore.photos.findIndex(p => p.id === selectedPhoto.value!.id)
      if (photoIndex > -1) {
        appStore.photos[photoIndex] = {
          ...appStore.photos[photoIndex],
          url: beautifiedUrl,
          tags: [...appStore.photos[photoIndex].tags, 'AI美化']
        }
        selectedPhoto.value = appStore.photos[photoIndex]
      }
    }
  } catch {
    alert('美化失败，请重试')
  } finally {
    isBeautifying.value = false
  }
}
</script>

<template>
  <div class="min-h-screen pb-20 px-4 pt-6 bg-gradient-to-br from-primary-50 to-secondary-50">
    <div class="max-w-md mx-auto">
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-primary-100 flex items-center justify-center">
            <Heart class="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 class="text-xl font-bold text-gray-800">我们的相册</h1>
            <p class="text-sm text-gray-500">记录美好瞬间</p>
          </div>
        </div>
        <button
          @click="showUploadModal = true"
          class="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-xl font-medium transition-all"
        >
          <ImagePlus class="w-5 h-5" />
          添加照片
        </button>
      </div>

      <div class="bg-white rounded-2xl p-2 shadow-sm mb-6">
        <div class="flex items-center gap-2 overflow-x-auto">
          <button
            v-for="cat in categories"
            :key="cat.id"
            @click="selectedCategory = cat.id"
            class="flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all"
            :class="selectedCategory === cat.id ? 'bg-primary-500 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'"
          >
            <component :is="cat.icon" class="w-4 h-4" />
            {{ cat.name }}
          </button>
        </div>
      </div>

      <div v-if="appStore.photos.length === 0" class="bg-white rounded-3xl p-12 shadow-sm text-center">
        <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <ImagePlus class="w-10 h-10 text-gray-400" />
        </div>
        <h3 class="text-lg font-bold text-gray-800 mb-2">还没有照片</h3>
        <p class="text-gray-500 mb-4">上传你们的第一张合影吧！</p>
        <button
          @click="showUploadModal = true"
          class="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-medium transition-all"
        >
          上传照片
        </button>
      </div>

      <div v-else-if="selectedCategory === 'all'" class="grid grid-cols-3 gap-2">
        <div
          v-for="photo in appStore.photos"
          :key="photo.id"
          @click="openPreview(photo)"
          class="aspect-square bg-gray-100 rounded-xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
        >
          <img :src="photo.url" :alt="photo.description" class="w-full h-full object-cover" />
        </div>
      </div>

      <div v-else-if="selectedCategory === 'date'" class="space-y-4">
        <div v-for="(photos, date) in photosByDate" :key="date">
          <div class="flex items-center gap-2 mb-2">
            <Calendar class="w-4 h-4 text-primary-500" />
            <span class="font-medium text-gray-700">{{ date }}</span>
            <span class="text-xs text-gray-400">({{ photos.length }}张)</span>
          </div>
          <div class="grid grid-cols-3 gap-2">
            <div
              v-for="photo in photos"
              :key="photo.id"
              @click="openPreview(photo)"
              class="aspect-square bg-gray-100 rounded-xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
            >
              <img :src="photo.url" :alt="photo.description" class="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="selectedCategory === 'tag' && Object.keys(photosByTag).length > 0" class="space-y-4">
        <div v-for="(photos, tag) in photosByTag" :key="tag">
          <div class="flex items-center gap-2 mb-2">
            <Star class="w-4 h-4 text-yellow-500" />
            <span class="font-medium text-gray-700">{{ tag }}</span>
            <span class="text-xs text-gray-400">({{ photos.length }}张)</span>
          </div>
          <div class="grid grid-cols-3 gap-2">
            <div
              v-for="photo in photos"
              :key="photo.id"
              @click="openPreview(photo)"
              class="aspect-square bg-gray-100 rounded-xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
            >
              <img :src="photo.url" :alt="photo.description" class="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="selectedCategory === 'tag' && Object.keys(photosByTag).length === 0" class="bg-white rounded-3xl p-8 shadow-sm text-center">
        <Star class="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p class="text-gray-500">还没有添加标签的照片</p>
      </div>

      <div v-if="selectedCategory === 'location'" class="bg-white rounded-3xl p-8 shadow-sm text-center">
        <MapPin class="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p class="text-gray-500">按地点分类功能开发中...</p>
      </div>

      <div v-if="appStore.photos.length > 0" class="mt-4 text-center">
        <p class="text-sm text-gray-500">共 {{ appStore.photos.length }} 张照片</p>
      </div>
    </div>

    <div v-if="showUploadModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div class="bg-white rounded-3xl p-6 w-full max-w-sm">
        <h2 class="text-xl font-bold text-gray-800 mb-4">上传照片</h2>
        
        <div
          @click="triggerFileInput"
          class="w-full h-40 bg-gray-100 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors mb-4"
        >
          <ImagePlus class="w-10 h-10 text-gray-400 mb-2" />
          <p class="text-sm text-gray-500">点击选择照片</p>
        </div>
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          class="hidden"
          @change="handleFileSelect"
        />

        <div class="space-y-3 mb-6">
          <input
            v-model="newPhotoDescription"
            type="text"
            placeholder="照片描述（可选）"
            class="w-full bg-gray-50 rounded-xl px-4 py-3 border-none outline-none text-gray-800 placeholder-gray-400"
          />
          <input
            v-model="newPhotoTags"
            type="text"
            placeholder="标签（用逗号分隔，可选）"
            class="w-full bg-gray-50 rounded-xl px-4 py-3 border-none outline-none text-gray-800 placeholder-gray-400"
          />
        </div>

        <div class="flex gap-3">
          <button
            @click="showUploadModal = false"
            class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-medium transition-all"
          >
            取消
          </button>
          <button
            @click="triggerFileInput"
            class="flex-1 bg-primary-500 hover:bg-primary-600 text-white py-3 rounded-xl font-medium transition-all"
          >
            选择照片
          </button>
        </div>
      </div>
    </div>

    <div v-if="showPreviewModal && selectedPhoto" class="fixed inset-0 bg-black/90 flex flex-col items-center justify-center z-50">
      <button
        @click="closePreview"
        class="absolute top-4 right-4 text-white p-2 hover:bg-white/20 rounded-full transition-colors"
      >
        <X class="w-6 h-6" />
      </button>

      <img :src="selectedPhoto.url" :alt="selectedPhoto.description" class="max-w-full max-h-[70vh] object-contain" />

      <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
        <p v-if="selectedPhoto.description" class="text-white text-lg font-medium mb-2">{{ selectedPhoto.description }}</p>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-white/70 text-sm">{{ formatDate(selectedPhoto.date) }}</p>
            <div v-if="selectedPhoto.tags.length > 0" class="flex gap-2 mt-1">
              <span
                v-for="tag in selectedPhoto.tags"
                :key="tag"
                class="bg-white/20 text-white text-xs px-2 py-1 rounded-full"
              >
                #{{ tag }}
              </span>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <button
              @click="beautifyPhoto"
              :disabled="isBeautifying"
              class="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-500 text-white px-4 py-2 rounded-xl transition-all"
            >
              <Sparkles class="w-5 h-5" />
              {{ isBeautifying ? '美化中...' : 'AI美化' }}
            </button>
            <button
              @click="deletePhoto(selectedPhoto.id)"
              class="flex items-center gap-2 text-red-400 hover:text-red-300 px-4 py-2 rounded-xl hover:bg-white/10 transition-all"
            >
              <Trash2 class="w-5 h-5" />
              删除
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
