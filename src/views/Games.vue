<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { Gamepad2, Heart, RotateCcw, Trophy, PenTool } from 'lucide-vue-next'

type GameKey = 'tictactoe' | 'rockpaper' | 'truth' | 'dare' | 'bomb' | 'draw' | 'puzzle' | 'quiz'

const currentGame = ref<GameKey>('tictactoe')

const games = [
  { key: 'tictactoe', label: '井字棋', icon: '⭕' },
  { key: 'rockpaper', label: '猜拳', icon: '✊' },
  { key: 'truth', label: '真心话', icon: '💝' },
  { key: 'dare', label: '大冒险', icon: '🎲' },
  { key: 'bomb', label: '数字炸弹', icon: '💣' },
  { key: 'draw', label: '你画我猜', icon: '🎨' },
  { key: 'puzzle', label: '情侣拼图', icon: '🧩' },
  { key: 'quiz', label: '拼图问答', icon: '🤔' }
]

const tictactoeBoard = ref<string[]>(Array(9).fill(''))
const tictactoeCurrentPlayer = ref('X')
const tictactoeWinner = ref<string | null>(null)
const tictactoeDraw = ref(false)

const rockpaperChoices = ['✊', '✋', '✌']
const playerChoice = ref<string | null>(null)
const computerChoice = ref<string | null>(null)
const rockpaperResult = ref<string | null>(null)

const truthQuestions = [
  '你最难忘的一次约会是哪次？',
  '你最喜欢我的哪一点？',
  '如果你能改变我身上的一件事，你会改变什么？',
  '你做过最浪漫的事是什么？',
  '你觉得我们什么时候最幸福？',
  '你对未来有什么期待？',
  '你最想和我一起去哪里旅行？',
  '你觉得我什么时候最可爱？',
  '你有没有偷偷为我做过什么事？',
  '如果我们有孩子，你希望他/她像谁？',
  '你最想对我说但还没说的话是什么？',
  '你觉得我们的爱情像什么？',
  '你最担心我们的什么问题？',
  '如果时光倒流，你还会选择和我在一起吗？',
  '你觉得我对你的爱有多少分？'
]
const currentQuestion = ref('')

const dareTasks = [
  '亲吻对方的额头',
  '给对方讲一个笑话',
  '深情地看着对方的眼睛30秒',
  '模仿对方的一个习惯动作',
  '说一句你从未说过的情话',
  '给对方一个拥抱',
  '夸对方三个优点',
  '唱一首情歌给对方听',
  '讲一件你第一次见到对方时的印象',
  '做一个鬼脸逗对方笑',
  '给对方发一条微信说"我爱你"',
  '跳一段搞笑的舞蹈',
  '说出对方最喜欢的三个东西',
  '闭着眼睛找到对方的手',
  '用方言对对方说一句情话'
]
const currentTask = ref('')

const bombMin = ref(1)
const bombMax = ref(100)
const bombTarget = ref(Math.floor(Math.random() * 100) + 1)
const bombGuess = ref('')
const bombResult = ref<string | null>(null)
const bombGameOver = ref(false)

const drawCanvas = ref<HTMLCanvasElement | null>(null)
const drawContext = ref<CanvasRenderingContext2D | null>(null)
const isDrawing = ref(false)
const drawWord = ref('')
const drawWords = ['爱心', '玫瑰', '月亮', '星星', '房子', '太阳', '雨伞', '气球', '蛋糕', '戒指', '花朵', '蝴蝶']
const drawTimer = ref(60)

const puzzleSize = ref(3)
const puzzlePieces = ref<{ id: number; correctId: number; x: number; y: number }[]>([])
const puzzleSelected = ref<number | null>(null)
const puzzleCompleted = ref(false)
const puzzleMoves = ref(0)

const quizQuestions = [
  {
    question: '我们第一次约会去了哪里？',
    options: ['餐厅', '公园', '电影院', '咖啡店'],
    answer: 0
  },
  {
    question: '我最喜欢的颜色是什么？',
    options: ['粉色', '蓝色', '白色', '紫色'],
    answer: 0
  },
  {
    question: '我们在一起多久了？',
    options: ['不到一年', '一到两年', '两到五年', '五年以上'],
    answer: 1
  },
  {
    question: '我最喜欢的食物是什么？',
    options: ['火锅', '西餐', '甜点', '日料'],
    answer: 2
  },
  {
    question: '我生日是哪一天？',
    options: ['一月', '六月', '十月', '十二月'],
    answer: 1
  }
]
const quizCurrentIndex = ref(0)
const quizScore = ref(0)
const quizAnswers = ref<(number | null)[]>([])
const quizFinished = ref(false)

const tictactoeWins = computed(() => {
  const wins = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ]
  return wins
})

function checkTictactoeWinner() {
  for (const win of tictactoeWins.value) {
    const [a, b, c] = win
    if (tictactoeBoard.value[a] && 
        tictactoeBoard.value[a] === tictactoeBoard.value[b] && 
        tictactoeBoard.value[a] === tictactoeBoard.value[c]) {
      tictactoeWinner.value = tictactoeBoard.value[a]
      return
    }
  }
  if (!tictactoeBoard.value.includes('')) {
    tictactoeDraw.value = true
  }
}

function tictactoeClick(index: number) {
  if (tictactoeBoard.value[index] || tictactoeWinner.value) return
  
  tictactoeBoard.value[index] = tictactoeCurrentPlayer.value
  checkTictactoeWinner()
  
  if (!tictactoeWinner.value && !tictactoeDraw.value) {
    tictactoeCurrentPlayer.value = tictactoeCurrentPlayer.value === 'X' ? 'O' : 'X'
  }
}

function resetTictactoe() {
  tictactoeBoard.value = Array(9).fill('')
  tictactoeCurrentPlayer.value = 'X'
  tictactoeWinner.value = null
  tictactoeDraw.value = false
}

function playRockPaper(choice: string) {
  playerChoice.value = choice
  computerChoice.value = rockpaperChoices[Math.floor(Math.random() * 3)]
  
  if (playerChoice.value === computerChoice.value) {
    rockpaperResult.value = '平局！'
  } else if (
    (playerChoice.value === '✊' && computerChoice.value === '✌') ||
    (playerChoice.value === '✋' && computerChoice.value === '✊') ||
    (playerChoice.value === '✌' && computerChoice.value === '✋')
  ) {
    rockpaperResult.value = '你赢了！🎉'
  } else {
    rockpaperResult.value = '你输了！😢'
  }
}

function resetRockPaper() {
  playerChoice.value = null
  computerChoice.value = null
  rockpaperResult.value = null
}

function getRandomQuestion() {
  currentQuestion.value = truthQuestions[Math.floor(Math.random() * truthQuestions.length)]
}

function getRandomTask() {
  currentTask.value = dareTasks[Math.floor(Math.random() * dareTasks.length)]
}

function guessBomb() {
  const num = parseInt(bombGuess.value)
  if (isNaN(num) || num < bombMin.value || num > bombMax.value) {
    bombResult.value = `请输入 ${bombMin.value}-${bombMax.value} 之间的数字`
    return
  }
  
  if (num === bombTarget.value) {
    bombResult.value = '💥 炸弹爆炸！你输了！'
    bombGameOver.value = true
  } else if (num < bombTarget.value) {
    bombMin.value = num + 1
    bombResult.value = `太小了！范围：${bombMin.value}-${bombMax.value}`
  } else {
    bombMax.value = num - 1
    bombResult.value = `太大了！范围：${bombMin.value}-${bombMax.value}`
  }
  
  bombGuess.value = ''
}

function resetBomb() {
  bombMin.value = 1
  bombMax.value = 100
  bombTarget.value = Math.floor(Math.random() * 100) + 1
  bombGuess.value = ''
  bombResult.value = null
  bombGameOver.value = false
}

function initDrawCanvas() {
  if (drawCanvas.value) {
    drawContext.value = drawCanvas.value.getContext('2d')
    if (drawContext.value) {
      drawContext.value.lineWidth = 3
      drawContext.value.lineCap = 'round'
      drawContext.value.lineJoin = 'round'
      drawContext.value.strokeStyle = '#3b82f6'
    }
  }
}

function startDraw() {
  isDrawing.value = true
}

function draw(e: MouseEvent) {
  if (!isDrawing.value || !drawContext.value || !drawCanvas.value) return
  
  const rect = drawCanvas.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  
  drawContext.value.lineTo(x, y)
  drawContext.value.stroke()
}

function stopDraw() {
  isDrawing.value = false
  if (drawContext.value) {
    drawContext.value.beginPath()
  }
}

function clearDraw() {
  if (drawContext.value && drawCanvas.value) {
    drawContext.value.clearRect(0, 0, drawCanvas.value.width, drawCanvas.value.height)
  }
}

function startDrawGame() {
  drawWord.value = drawWords[Math.floor(Math.random() * drawWords.length)]
  drawTimer.value = 60
  clearDraw()
  
  const timer = setInterval(() => {
    drawTimer.value--
    if (drawTimer.value <= 0) {
      clearInterval(timer)
      alert(`时间到！答案是：${drawWord.value}`)
    }
  }, 1000)
}

function initPuzzle() {
  const size = puzzleSize.value * puzzleSize.value
  puzzlePieces.value = []
  
  for (let i = 0; i < size; i++) {
    const row = Math.floor(i / puzzleSize.value)
    const col = i % puzzleSize.value
    puzzlePieces.value.push({
      id: i,
      correctId: i,
      x: col,
      y: row
    })
  }
  
  for (let i = puzzlePieces.value.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[puzzlePieces.value[i], puzzlePieces.value[j]] = [puzzlePieces.value[j], puzzlePieces.value[i]]
  }
  
  puzzleSelected.value = null
  puzzleCompleted.value = false
  puzzleMoves.value = 0
}

function selectPuzzlePiece(id: number) {
  if (puzzleCompleted.value) return
  
  if (puzzleSelected.value === null) {
    puzzleSelected.value = id
  } else if (puzzleSelected.value === id) {
    puzzleSelected.value = null
  } else {
    const piece1 = puzzlePieces.value.find(p => p.id === puzzleSelected.value)
    const piece2 = puzzlePieces.value.find(p => p.id === id)
    
    if (piece1 && piece2) {
      ;[piece1.x, piece2.x] = [piece2.x, piece1.x]
      ;[piece1.y, piece2.y] = [piece2.y, piece1.y]
      puzzleMoves.value++
      
      checkPuzzleComplete()
    }
    
    puzzleSelected.value = null
  }
}

function checkPuzzleComplete() {
  const isComplete = puzzlePieces.value.every(p => p.x === p.correctId % puzzleSize.value && p.y === Math.floor(p.correctId / puzzleSize.value))
  if (isComplete) {
    puzzleCompleted.value = true
  }
}

function submitQuizAnswer(index: number) {
  quizAnswers.value[quizCurrentIndex.value] = index
  
  if (index === quizQuestions[quizCurrentIndex.value].answer) {
    quizScore.value++
  }
  
  if (quizCurrentIndex.value < quizQuestions.length - 1) {
    quizCurrentIndex.value++
  } else {
    quizFinished.value = true
  }
}

function resetQuiz() {
  quizCurrentIndex.value = 0
  quizScore.value = 0
  quizAnswers.value = Array(quizQuestions.length).fill(null)
  quizFinished.value = false
}

onMounted(() => {
  getRandomQuestion()
  getRandomTask()
  initDrawCanvas()
  initPuzzle()
  
  nextTick(() => {
    initDrawCanvas()
  })
})
</script>

<template>
  <div class="min-h-screen pb-20 px-4 pt-6 bg-gradient-to-br from-primary-50 to-secondary-50">
    <div class="max-w-md mx-auto">
      <div class="flex items-center gap-3 mb-6">
        <div class="w-12 h-12 rounded-2xl bg-primary-100 flex items-center justify-center">
          <Gamepad2 class="w-6 h-6 text-primary-600" />
        </div>
        <div>
          <h1 class="text-xl font-bold text-gray-800">双人小游戏</h1>
          <p class="text-sm text-gray-500">和宝贝一起玩耍</p>
        </div>
      </div>

      <div class="flex flex-wrap gap-2 mb-6">
        <button
          v-for="game in games"
          :key="game.key"
          @click="currentGame = game.key as GameKey"
          class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
          :class="currentGame === game.key ? 'bg-primary-500 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50 shadow-sm'"
        >
          <span>{{ game.icon }}</span>
          {{ game.label }}
        </button>
      </div>

      <div v-if="currentGame === 'tictactoe'" class="bg-white rounded-3xl p-6 shadow-lg">
        <div class="text-center mb-6">
          <h2 class="text-xl font-bold text-gray-800 mb-2">井字棋</h2>
          <p class="text-sm text-gray-500">
            <span v-if="tictactoeWinner">
              <Trophy class="w-5 h-5 inline text-yellow-500" />
              {{ tictactoeWinner === 'X' ? 'X 获胜！' : 'O 获胜！' }}
            </span>
            <span v-else-if="tictactoeDraw">平局！</span>
            <span v-else>当前回合：<span class="font-bold">{{ tictactoeCurrentPlayer }}</span></span>
          </p>
        </div>
        <div class="grid grid-cols-3 gap-3 max-w-[240px] mx-auto mb-6">
          <button
            v-for="(cell, index) in tictactoeBoard"
            :key="index"
            @click="tictactoeClick(index)"
            class="w-20 h-20 bg-gray-50 rounded-xl text-4xl font-bold flex items-center justify-center transition-all hover:bg-gray-100"
            :class="{
              'bg-green-100 text-green-600': tictactoeWinner && tictactoeWins.some(win => win.includes(index) && tictactoeBoard[win[0]] === tictactoeWinner),
              'bg-red-100 text-red-600': tictactoeWinner && !tictactoeWins.some(win => win.includes(index) && tictactoeBoard[win[0]] === tictactoeWinner) && cell
            }"
          >
            {{ cell }}
          </button>
        </div>
        <button @click="resetTictactoe" class="w-full flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white py-3 rounded-xl font-medium transition-all">
          <RotateCcw class="w-5 h-5" />
          重新开始
        </button>
      </div>

      <div v-if="currentGame === 'rockpaper'" class="bg-white rounded-3xl p-6 shadow-lg">
        <div class="text-center mb-6">
          <h2 class="text-xl font-bold text-gray-800 mb-2">猜拳游戏</h2>
          <p class="text-sm text-gray-500">✊ 石头 | ✋ 布 | ✌ 剪刀</p>
        </div>
        <div class="flex justify-center gap-4 mb-6">
          <button
            v-for="choice in rockpaperChoices"
            :key="choice"
            @click="playRockPaper(choice)"
            :disabled="playerChoice !== null"
            class="w-20 h-20 bg-gray-50 rounded-2xl text-4xl flex items-center justify-center transition-all hover:bg-gray-100 disabled:opacity-50"
            :class="{
              'bg-green-100 ring-2 ring-green-500': playerChoice === choice && rockpaperResult === '你赢了！🎉',
              'bg-red-100 ring-2 ring-red-500': playerChoice === choice && rockpaperResult === '你输了！😢',
              'bg-yellow-100 ring-2 ring-yellow-500': playerChoice === choice && rockpaperResult === '平局！'
            }"
          >
            {{ choice }}
          </button>
        </div>
        <div v-if="playerChoice && computerChoice" class="bg-gray-50 rounded-2xl p-4 mb-6">
          <div class="flex justify-around items-center">
            <div class="text-center">
              <p class="text-sm text-gray-500 mb-2">你</p>
              <p class="text-4xl">{{ playerChoice }}</p>
            </div>
            <div class="text-2xl text-gray-400">VS</div>
            <div class="text-center">
              <p class="text-sm text-gray-500 mb-2">AI</p>
              <p class="text-4xl">{{ computerChoice }}</p>
            </div>
          </div>
          <p class="text-center text-xl font-bold mt-4" :class="{
            'text-green-600': rockpaperResult === '你赢了！🎉',
            'text-red-600': rockpaperResult === '你输了！😢',
            'text-yellow-600': rockpaperResult === '平局！'
          }">
            {{ rockpaperResult }}
          </p>
        </div>
        <button @click="resetRockPaper" class="w-full flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white py-3 rounded-xl font-medium transition-all">
          <RotateCcw class="w-5 h-5" />
          再来一局
        </button>
      </div>

      <div v-if="currentGame === 'truth'" class="bg-white rounded-3xl p-6 shadow-lg">
        <div class="text-center mb-6">
          <h2 class="text-xl font-bold text-gray-800 mb-2">真心话</h2>
          <p class="text-sm text-gray-500">说出你的真心话</p>
        </div>
        <div class="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-2xl p-6 mb-6">
          <Heart class="w-8 h-8 text-primary-500 mx-auto mb-4" />
          <p class="text-lg font-medium text-gray-800 text-center leading-relaxed">{{ currentQuestion }}</p>
        </div>
        <button @click="getRandomQuestion" class="w-full flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white py-3 rounded-xl font-medium transition-all">
          <Heart class="w-5 h-5" />
          换一个问题
        </button>
        <div class="mt-6 p-4 bg-gray-50 rounded-xl">
          <p class="text-sm text-gray-500 text-center">💡 提示：轮流回答问题，增进彼此了解</p>
        </div>
      </div>

      <div v-if="currentGame === 'dare'" class="bg-white rounded-3xl p-6 shadow-lg">
        <div class="text-center mb-6">
          <h2 class="text-xl font-bold text-gray-800 mb-2">大冒险</h2>
          <p class="text-sm text-gray-500">完成挑战，增进感情</p>
        </div>
        <div class="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl p-6 mb-6">
          <div class="text-6xl text-center mb-4">🎲</div>
          <p class="text-lg font-medium text-gray-800 text-center leading-relaxed">{{ currentTask }}</p>
        </div>
        <button @click="getRandomTask" class="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-medium transition-all">
          <RotateCcw class="w-5 h-5" />
          换一个任务
        </button>
        <div class="mt-6 p-4 bg-gray-50 rounded-xl">
          <p class="text-sm text-gray-500 text-center">💡 提示：轮流抽取任务，输的人完成挑战</p>
        </div>
      </div>

      <div v-if="currentGame === 'bomb'" class="bg-white rounded-3xl p-6 shadow-lg">
        <div class="text-center mb-6">
          <h2 class="text-xl font-bold text-gray-800 mb-2">数字炸弹</h2>
          <p class="text-sm text-gray-500">猜数字，别碰到炸弹！</p>
        </div>
        <div class="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl p-6 mb-6">
          <div class="text-6xl text-center mb-4">💣</div>
          <p class="text-lg font-medium text-gray-800 text-center mb-4">范围：{{ bombMin }} - {{ bombMax }}</p>
          <div class="flex gap-2">
            <input v-model="bombGuess" @keyup.enter="guessBomb" type="number" placeholder="输入数字" class="flex-1 bg-white rounded-xl px-4 py-3 border-2 border-gray-200 outline-none focus:border-red-500" />
            <button @click="guessBomb" :disabled="bombGameOver" class="bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white px-6 py-3 rounded-xl font-medium transition-all">
              猜
            </button>
          </div>
          <p v-if="bombResult" class="text-center mt-4 font-medium" :class="bombGameOver ? 'text-red-600' : 'text-gray-600'">{{ bombResult }}</p>
        </div>
        <button @click="resetBomb" class="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-medium transition-all">
          <RotateCcw class="w-5 h-5" />
          重新开始
        </button>
      </div>

      <div v-if="currentGame === 'draw'" class="bg-white rounded-3xl p-6 shadow-lg">
        <div class="text-center mb-6">
          <h2 class="text-xl font-bold text-gray-800 mb-2">你画我猜</h2>
          <p class="text-sm text-gray-500">画出词语，让对方猜</p>
        </div>
        <div class="bg-gray-100 rounded-2xl p-4 mb-4">
          <canvas
            ref="drawCanvas"
            width="300"
            height="200"
            @mousedown="startDraw"
            @mousemove="draw"
            @mouseup="stopDraw"
            @mouseleave="stopDraw"
            class="w-full bg-white rounded-xl cursor-crosshair border-2 border-gray-200"
          ></canvas>
        </div>
        <div class="flex justify-between items-center mb-4">
          <div class="flex gap-2">
            <button @click="clearDraw" class="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl font-medium transition-all">
              <RotateCcw class="w-4 h-4" />
              清空
            </button>
          </div>
          <div class="text-lg font-bold text-primary-600">
            🕐 {{ drawTimer }}秒
          </div>
        </div>
        <button @click="startDrawGame" class="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-medium transition-all">
          <PenTool class="w-5 h-5" />
          开始游戏
        </button>
        <div v-if="drawWord" class="mt-4 p-4 bg-blue-50 rounded-xl text-center">
          <p class="text-sm text-blue-600">🎯 要画的词：<span class="font-bold">{{ drawWord }}</span></p>
        </div>
      </div>

      <div v-if="currentGame === 'puzzle'" class="bg-white rounded-3xl p-6 shadow-lg">
        <div class="text-center mb-6">
          <h2 class="text-xl font-bold text-gray-800 mb-2">情侣拼图</h2>
          <p class="text-sm text-gray-500">完成拼图，获得奖励</p>
          <div class="flex justify-center gap-2 mt-2">
            <button
              v-for="size in [3, 4, 5]"
              :key="size"
              @click="puzzleSize = size; initPuzzle()"
              class="px-3 py-1 rounded-lg text-sm transition-all"
              :class="puzzleSize === size ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600'"
            >
              {{ size }}x{{ size }}
            </button>
          </div>
        </div>
        <div class="flex justify-center mb-6">
          <div
            class="grid gap-1"
            :style="{ gridTemplateColumns: `repeat(${puzzleSize}, 1fr)` }"
          >
            <button
              v-for="piece in puzzlePieces"
              :key="piece.id"
              @click="selectPuzzlePiece(piece.id)"
              class="w-16 h-16 rounded-lg flex items-center justify-center text-2xl font-bold transition-all"
              :class="puzzleSelected === piece.id ? 'bg-primary-500 text-white ring-4 ring-primary-300' : 'bg-gradient-to-br from-primary-100 to-secondary-100 text-gray-600 hover:bg-primary-200'"
            >
              {{ piece.id + 1 }}
            </button>
          </div>
        </div>
        <div class="flex justify-between items-center mb-4">
          <p class="text-gray-500">步数：<span class="font-bold text-primary-600">{{ puzzleMoves }}</span></p>
          <p v-if="puzzleCompleted" class="text-green-600 font-bold flex items-center gap-1">
            <Trophy class="w-5 h-5" />
            完成！
          </p>
        </div>
        <button @click="initPuzzle" class="w-full flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white py-3 rounded-xl font-medium transition-all">
          <RotateCcw class="w-5 h-5" />
          重新开始
        </button>
      </div>

      <div v-if="currentGame === 'quiz'" class="bg-white rounded-3xl p-6 shadow-lg">
        <div class="text-center mb-6">
          <h2 class="text-xl font-bold text-gray-800 mb-2">恋爱拼图问答</h2>
          <p class="text-sm text-gray-500">测试你们的默契程度</p>
          <div class="flex justify-center gap-2 mt-2">
            <span class="text-sm text-gray-400">{{ quizCurrentIndex + 1 }}/{{ quizQuestions.length }}</span>
            <span class="text-sm text-primary-600 font-bold">得分：{{ quizScore }}</span>
          </div>
        </div>
        
        <div v-if="!quizFinished" class="space-y-4">
          <div class="bg-gradient-to-br from-purple-50 to-primary-50 rounded-2xl p-4">
            <p class="text-lg font-medium text-gray-800">{{ quizQuestions[quizCurrentIndex].question }}</p>
          </div>
          <div class="space-y-3">
            <button
              v-for="(option, index) in quizQuestions[quizCurrentIndex].options"
              :key="index"
              @click="submitQuizAnswer(index)"
              class="w-full text-left p-4 rounded-xl transition-all border-2"
              :class="quizAnswers[quizCurrentIndex] === index
                ? (index === quizQuestions[quizCurrentIndex].answer ? 'border-green-500 bg-green-50 text-green-700' : 'border-red-500 bg-red-50 text-red-700')
                : 'border-gray-200 hover:border-primary-300 bg-gray-50'"
            >
              <span class="font-bold mr-2">{{ String.fromCharCode(65 + index) }}.</span>
              {{ option }}
            </button>
          </div>
        </div>

        <div v-else class="text-center py-8">
          <div class="text-6xl mb-4">{{ quizScore === quizQuestions.length ? '🏆' : quizScore >= quizQuestions.length / 2 ? '🎉' : '💪' }}</div>
          <p class="text-2xl font-bold text-gray-800 mb-2">
            你的得分：{{ quizScore }}/{{ quizQuestions.length }}
          </p>
          <p class="text-gray-500 mb-6">
            {{ quizScore === quizQuestions.length ? '完美！你太了解她了！' : quizScore >= quizQuestions.length / 2 ? '不错！继续加油！' : '还需要多了解她哦！' }}
          </p>
        </div>

        <button @click="resetQuiz" class="w-full flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-600 text-white py-3 rounded-xl font-medium transition-all">
          <RotateCcw class="w-5 h-5" />
          {{ quizFinished ? '再测一次' : '跳过此题' }}
        </button>
      </div>
    </div>
  </div>
</template>
