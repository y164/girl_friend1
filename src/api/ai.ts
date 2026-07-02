import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1'
const API_KEY = import.meta.env.VITE_API_KEY || ''

const aiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json'
  }
})

export interface ChatResponse {
  content: string
  role: 'assistant' | 'user'
}

export async function chatWithAI(messages: { role: string; content: string }[], model: string = 'qwen3.7-plus'): Promise<ChatResponse> {
  try {
    const response = await aiClient.post('/chat/completions', {
      model,
      messages,
      temperature: 0.8,
      max_tokens: 2000
    })
    return response.data.choices[0].message
  } catch (error) {
    console.error('AI chat error:', error)
    return {
      content: '抱歉，我现在有点累了，稍后再聊吧~',
      role: 'assistant'
    }
  }
}

export async function generateLoveMessage(): Promise<string> {
  const messages = [
    {
      role: 'system',
      content: '你是一个温柔浪漫的男朋友，说话甜蜜、体贴、充满爱意。请生成一句简短的情话，不超过50字。'
    },
    {
      role: 'user',
      content: '请生成一句浪漫的情话'
    }
  ]
  const response = await chatWithAI(messages)
  return response.content
}

export async function analyzeMood(content: string): Promise<string> {
  const messages = [
    {
      role: 'system',
      content: '你是一个贴心的情感分析师，擅长理解女生的心情。请用温柔的语气分析这段日记的情绪，并给出温暖的回应和建议。'
    },
    {
      role: 'user',
      content: `分析这段日记的心情并给出建议：\n${content}`
    }
  ]
  const response = await chatWithAI(messages)
  return response.content
}

export async function biologyQA(question: string): Promise<string> {
  const messages = [
    {
      role: 'system',
      content: '你是一个专业的高中生物老师，精通高中生物所有知识点，包括细胞生物学、遗传学、生态学等。请用简洁明了的语言回答问题，适合高中生理解。'
    },
    {
      role: 'user',
      content: question
    }
  ]
  const response = await chatWithAI(messages)
  return response.content
}

export async function generateLessonPlan(topic: string): Promise<string> {
  const messages = [
    {
      role: 'system',
      content: '你是一个经验丰富的高中生物老师，请为指定的教学主题生成一份详细的教案，包括教学目标、教学重难点、教学过程、课堂练习和作业布置。'
    },
    {
      role: 'user',
      content: `请为以下高中生物主题生成一份教案：${topic}`
    }
  ]
  const response = await chatWithAI(messages)
  return response.content
}

export async function generateExamQuestions(topic: string, count: number = 5): Promise<string> {
  const messages = [
    {
      role: 'system',
      content: '你是一个专业的高中生物出题老师，请根据指定的知识点生成选择题和填空题，包含答案和解析。'
    },
    {
      role: 'user',
      content: `请为以下高中生物知识点生成${count}道练习题（包含选择题和填空题），并附上答案和解析：${topic}`
    }
  ]
  const response = await chatWithAI(messages)
  return response.content
}

export async function recommendGift(preferences: string): Promise<string> {
  const messages = [
    {
      role: 'system',
      content: '你是一个贴心的礼物推荐专家，擅长根据女生的喜好推荐合适的礼物。请推荐3-5个礼物，并说明推荐理由。'
    },
    {
      role: 'user',
      content: `女生喜好：${preferences}，请推荐适合她的礼物`
    }
  ]
  const response = await chatWithAI(messages)
  return response.content
}

export async function generateLoveStory(prompt: string): Promise<ChatResponse> {
  const messages = [
    {
      role: 'system',
      content: '你是一个浪漫的爱情故事作家，擅长用温馨、甜蜜的语言讲述爱情故事。请用第一人称视角，写一个感人的恋爱故事。'
    },
    {
      role: 'user',
      content: prompt
    }
  ]
  return chatWithAI(messages)
}

export async function generateTestQuestion(): Promise<ChatResponse> {
  const messages = [
    {
      role: 'system',
      content: '你是一个恋爱测试专家，请生成5道关于情侣之间了解程度的选择题，以JSON格式返回，包含question和options字段。例如：[{"id":1,"question":"...","options":["...","...","...","..."]}]'
    },
    {
      role: 'user',
      content: '请生成5道恋爱默契测试题，每道题4个选项，返回JSON格式'
    }
  ]
  return chatWithAI(messages)
}

export async function generateCardMessage(prompt: string): Promise<string> {
  const messages = [
    {
      role: 'system',
      content: '你是一个创意贺卡设计师，请根据主题生成一段温馨、浪漫的祝福语。'
    },
    {
      role: 'user',
      content: prompt
    }
  ]
  const response = await chatWithAI(messages)
  return response.content
}
