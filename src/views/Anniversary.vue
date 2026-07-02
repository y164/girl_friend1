<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAppStore } from '../stores/app'
import { generateCardMessage, recommendGift } from '../api/ai'
import { Calendar, Gift, Heart, Sparkles, Plus, Trash2, Check, X, Send, ShoppingBag, CreditCard, Package } from 'lucide-vue-next'
import dayjs from 'dayjs'

const appStore = useAppStore()

const currentTab = ref<'anniversary' | 'gifts' | 'card'>('anniversary')
const showAddGiftModal = ref(false)
const showCardModal = ref(false)
const isGenerating = ref(false)

const newGift = ref({
  name: '',
  description: '',
  price: '',
  category: '饰品',
  status: 'wishlist' as 'wishlist' | 'purchased' | 'received',
  link: '',
  notes: ''
})

const cardContent = ref({
  occasion: '',
  message: ''
})

const categories = ['饰品', '化妆品', '服装', '包包', '电子产品', '美食', '旅行', '其他']

const giftStatusConfig = {
  wishlist: { label: '想要', icon: ShoppingBag, color: 'bg-gray-100 text-gray-600' },
  purchased: { label: '已购买', icon: CreditCard, color: 'bg-blue-100 text-blue-600' },
  received: { label: '已收到', icon: Package, color: 'bg-green-100 text-green-600' }
}

const upcomingAnniversaries = computed(() => {
  const now = dayjs()
  return appStore.anniversaryList
    .map(item => {
      let targetDate = dayjs(item.date)
      if (targetDate.isBefore(now)) {
        targetDate = targetDate.add(1, 'year')
      }
      return {
        ...item,
        days: targetDate.diff(now, 'day'),
        displayDate: targetDate.format('YYYY年MM月DD日')
      }
    })
    .sort((a, b) => a.days - b.days)
})

function addGift() {
  if (!newGift.value.name) {
    alert('请填写礼物名称')
    return
  }
  
  appStore.addGift({
    name: newGift.value.name,
    description: newGift.value.description,
    price: newGift.value.price,
    category: newGift.value.category,
    status: newGift.value.status,
    link: newGift.value.link || undefined,
    notes: newGift.value.notes || undefined
  })
  
  newGift.value = {
    name: '',
    description: '',
    price: '',
    category: '饰品',
    status: 'wishlist',
    link: '',
    notes: ''
  }
  
  showAddGiftModal.value = false
}

function deleteGift(id: string) {
  if (confirm('确定要删除这个礼物吗？')) {
    appStore.deleteGift(id)
  }
}

async function generateCard() {
  if (!cardContent.value.occasion) {
    alert('请选择贺卡场合')
    return
  }
  
  isGenerating.value = true
  
  try {
    const message = await generateCardMessage(`请为${cardContent.value.occasion}生成一段温馨浪漫的祝福语，写给女朋友`)
    cardContent.value.message = message
  } catch {
    cardContent.value.message = '愿你每天都开心快乐，永远被爱包围！爱你的我。'
  } finally {
    isGenerating.value = false
  }
}

async function getGiftRecommendations() {
  isGenerating.value = true
  
  try {
    const recommendations = await recommendGift('喜欢可爱、浪漫的礼物，适合女生')
    
    alert(`推荐礼物：\n\n${recommendations}`)
  } catch {
    alert('推荐失败，请重试')
  } finally {
    isGenerating.value = false
  }
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
          <h1 class="text-xl font-bold text-gray-800">纪念日</h1>
          <p class="text-sm text-gray-500">记录每一个重要时刻</p>
        </div>
      </div>

      <div class="bg-white rounded-2xl p-2 shadow-sm mb-6">
        <div class="flex items-center gap-2 overflow-x-auto">
          <button
            @click="currentTab = 'anniversary'"
            class="flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all"
            :class="currentTab === 'anniversary' ? 'bg-primary-500 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'"
          >
            <Calendar class="w-4 h-4" />
            纪念日列表
          </button>
          <button
            @click="currentTab = 'gifts'"
            class="flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all"
            :class="currentTab === 'gifts' ? 'bg-primary-500 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'"
          >
            <Gift class="w-4 h-4" />
            礼物清单
          </button>
          <button
            @click="currentTab = 'card'"
            class="flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all"
            :class="currentTab === 'card' ? 'bg-primary-500 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'"
          >
            <Sparkles class="w-4 h-4" />
            电子贺卡
          </button>
        </div>
      </div>

      <div v-if="currentTab === 'anniversary'" class="space-y-4">
        <div v-for="item in upcomingAnniversaries" :key="item.id" class="bg-white rounded-2xl p-4 shadow-sm">
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-xl flex items-center justify-center" :class="item.type === 'birthday' ? 'bg-pink-100' : item.type === 'anniversary' ? 'bg-primary-100' : 'bg-yellow-100'">
                <Heart v-if="item.type === 'anniversary'" class="w-6 h-6 text-primary-500" />
                <Gift v-else-if="item.type === 'birthday'" class="w-6 h-6 text-pink-500" />
                <Calendar v-else class="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <h3 class="font-bold text-gray-800">{{ item.name }}</h3>
                <p class="text-sm text-gray-500">{{ item.displayDate }}</p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-2xl font-bold text-primary-500">{{ item.days }}</p>
              <p class="text-xs text-gray-400">天后</p>
            </div>
          </div>
          <button @click="deleteGift(item.id)" class="text-gray-400 hover:text-red-500 text-sm">
            删除
          </button>
        </div>
      </div>

      <div v-if="currentTab === 'gifts'" class="space-y-4">
        <div class="flex items-center justify-between">
          <button
            @click="showAddGiftModal = true"
            class="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-xl font-medium transition-all"
          >
            <Plus class="w-5 h-5" />
            添加礼物
          </button>
          <button
            @click="getGiftRecommendations"
            :disabled="isGenerating"
            class="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-xl font-medium transition-all"
          >
            <Sparkles class="w-5 h-5" />
            AI推荐
          </button>
        </div>

        <div v-if="appStore.giftList.length === 0" class="bg-white rounded-3xl p-12 shadow-sm text-center">
          <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Gift class="w-10 h-10 text-gray-400" />
          </div>
          <h3 class="text-lg font-bold text-gray-800 mb-2">礼物清单为空</h3>
          <p class="text-gray-500">添加她想要的礼物吧！</p>
        </div>

        <div v-for="gift in appStore.giftList" :key="gift.id" class="bg-white rounded-2xl p-4 shadow-sm">
          <div class="flex items-start justify-between mb-2">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                <h3 class="font-bold text-gray-800">{{ gift.name }}</h3>
                <span class="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">{{ gift.category }}</span>
              </div>
              <p v-if="gift.description" class="text-sm text-gray-600 mb-1">{{ gift.description }}</p>
              <div class="flex items-center gap-3 text-sm text-gray-500">
                <span>💰 {{ gift.price || '未定价' }}</span>
                <span v-if="gift.notes" class="text-gray-400">{{ gift.notes }}</span>
              </div>
            </div>
            <button @click="deleteGift(gift.id)" class="text-gray-400 hover:text-red-500">
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
          
          <div class="flex items-center gap-2 mt-3">
            <button
              v-for="(config, status) in giftStatusConfig"
              :key="status"
              @click="appStore.updateGiftStatus(gift.id, status as 'wishlist' | 'purchased' | 'received')"
              class="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              :class="gift.status === status ? config.color : 'bg-gray-50 text-gray-400 hover:bg-gray-100'"
            >
              <component :is="config.icon" class="w-3 h-3" />
              {{ config.label }}
            </button>
          </div>
        </div>
      </div>

      <div v-if="currentTab === 'card'" class="space-y-4">
        <div class="bg-white rounded-2xl p-6 shadow-sm">
          <h2 class="text-lg font-bold text-gray-800 mb-4">创建电子贺卡</h2>
          
          <div class="space-y-4 mb-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">选择场合</label>
              <select
                v-model="cardContent.occasion"
                class="w-full bg-gray-50 rounded-xl px-4 py-3 border-none outline-none text-gray-800"
              >
                <option value="">请选择场合</option>
                <option value="生日">生日</option>
                <option value="恋爱纪念日">恋爱纪念日</option>
                <option value="情人节">情人节</option>
                <option value="七夕">七夕</option>
                <option value="圣诞节">圣诞节</option>
                <option value="新年">新年</option>
                <option value="感谢">感谢</option>
                <option value="道歉">道歉</option>
              </select>
            </div>
            
            <button
              @click="generateCard"
              :disabled="isGenerating"
              class="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 text-white py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
            >
              <Sparkles class="w-5 h-5" />
              {{ isGenerating ? '生成中...' : 'AI生成祝福语' }}
            </button>
          </div>

          <div v-if="cardContent.message" class="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-2xl p-6 border-2 border-dashed border-primary-200">
            <div class="text-center">
              <Heart class="w-8 h-8 text-primary-500 mx-auto mb-3" />
              <p class="text-gray-700 leading-relaxed mb-4">{{ cardContent.message }}</p>
              <div class="flex items-center justify-center gap-2 text-xs text-gray-400">
                <Sparkles class="w-3 h-3" />
                <span>爱你的男朋友</span>
              </div>
            </div>
          </div>

          <button
            v-if="cardContent.message"
            @click="showCardModal = true"
            class="w-full mt-4 bg-primary-500 hover:bg-primary-600 text-white py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
          >
            <Send class="w-5 h-5" />
            发送贺卡
          </button>
        </div>
      </div>

      <div v-if="showAddGiftModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
        <div class="bg-white rounded-3xl p-6 w-full max-w-sm">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-bold text-gray-800">添加礼物</h2>
            <button @click="showAddGiftModal = false" class="text-gray-400 hover:text-gray-600">
              <X class="w-6 h-6" />
            </button>
          </div>
          
          <div class="space-y-4 mb-6">
            <input
              v-model="newGift.name"
              type="text"
              placeholder="礼物名称"
              class="w-full bg-gray-50 rounded-xl px-4 py-3 border-none outline-none text-gray-800 placeholder-gray-400"
            />
            <input
              v-model="newGift.description"
              type="text"
              placeholder="描述（可选）"
              class="w-full bg-gray-50 rounded-xl px-4 py-3 border-none outline-none text-gray-800 placeholder-gray-400"
            />
            <input
              v-model="newGift.price"
              type="text"
              placeholder="价格（可选）"
              class="w-full bg-gray-50 rounded-xl px-4 py-3 border-none outline-none text-gray-800 placeholder-gray-400"
            />
            <select
              v-model="newGift.category"
              class="w-full bg-gray-50 rounded-xl px-4 py-3 border-none outline-none text-gray-800"
            >
              <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
            </select>
            <textarea
              v-model="newGift.notes"
              placeholder="备注（可选）"
              rows="2"
              class="w-full bg-gray-50 rounded-xl px-4 py-3 border-none outline-none text-gray-800 placeholder-gray-400 resize-none"
            ></textarea>
          </div>
          
          <button
            @click="addGift"
            class="w-full bg-primary-500 hover:bg-primary-600 text-white py-3 rounded-xl font-medium transition-all"
          >
            保存礼物
          </button>
        </div>
      </div>

      <div v-if="showCardModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
        <div class="bg-white rounded-3xl p-6 w-full max-w-sm text-center">
          <div class="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check class="w-8 h-8 text-primary-500" />
          </div>
          <h2 class="text-xl font-bold text-gray-800 mb-2">贺卡已发送</h2>
          <p class="text-gray-500 mb-6">她收到了你的心意！</p>
          <button
            @click="showCardModal = false"
            class="w-full bg-primary-500 hover:bg-primary-600 text-white py-3 rounded-xl font-medium transition-all"
          >
            知道了
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
