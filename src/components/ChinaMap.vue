<script setup lang="ts">
import { computed } from 'vue'
import { chinaProvinces, normalizeProvinceName } from '../data/chinaMapData'

interface Spot {
  province: string
  lat: number
  lng: number
  name: string
}

const props = defineProps<{
  visitedProvinces: string[]
  spots: Spot[]
}>()

const SVG_WIDTH = 600
const SVG_HEIGHT = 350
const PADDING = 20

const minLng = 73.66
const maxLng = 135.05
const minLat = 3.86
const maxLat = 53.55

function latLngToSvg(lat: number, lng: number): { x: number; y: number } {
  const x = PADDING + ((lng - minLng) / (maxLng - minLng)) * (SVG_WIDTH - PADDING * 2)
  const y = PADDING + ((maxLat - lat) / (maxLat - minLat)) * (SVG_HEIGHT - PADDING * 2)
  return { x: Math.max(PADDING, Math.min(SVG_WIDTH - PADDING, x)), y: Math.max(PADDING, Math.min(SVG_HEIGHT - PADDING, y)) }
}

function coordinatesToPath(coordinates: number[][][]): string {
  const paths: string[] = []
  
  for (const ring of coordinates) {
    if (ring.length < 3) continue
    
    let path = ''
    ring.forEach(([lng, lat], index) => {
      const { x, y } = latLngToSvg(lat, lng)
      if (index === 0) {
        path += `M ${x} ${y}`
      } else {
        path += ` L ${x} ${y}`
      }
    })
    path += ' Z'
    paths.push(path)
  }
  
  return paths.join(' ')
}

const visitedSet = computed(() => {
  const set = new Set<string>()
  props.visitedProvinces.forEach(p => {
    set.add(normalizeProvinceName(p))
  })
  return set
})

const spotPositions = computed(() => {
  return props.spots.map(spot => ({
    ...spot,
    position: latLngToSvg(spot.lat, spot.lng),
    normalizedProvince: normalizeProvinceName(spot.province)
  }))
})
</script>

<template>
  <div class="relative w-full">
    <svg :viewBox="`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="visitedGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#f472b6" />
          <stop offset="100%" stop-color="#ec4899" />
        </linearGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1" dy="1" stdDeviation="2" flood-opacity="0.3" />
        </filter>
      </defs>
      
      <rect :x="0" :y="0" :width="SVG_WIDTH" :height="SVG_HEIGHT" fill="#fdf2f8" rx="16" />
      
      <g filter="url(#shadow)">
        <path
          v-for="province in chinaProvinces"
          :key="province.nameZh"
          :d="coordinatesToPath(province.coordinates)"
          :fill="visitedSet.has(province.nameZh) ? 'url(#visitedGradient)' : '#fee2e2'"
          stroke="#fca5a5"
          stroke-width="0.5"
          class="transition-all duration-300 cursor-pointer hover:opacity-80"
        />
      </g>
      
      <g>
        <g
          v-for="spot in spotPositions"
          :key="`${spot.name}-${spot.lat}-${spot.lng}`"
          :transform="`translate(${spot.position.x}, ${spot.position.y})`"
          class="cursor-pointer"
        >
          <circle r="6" fill="#ec4899" opacity="0.4" />
          <circle r="4" fill="#ec4899" />
          <circle r="1.5" fill="white" />
        </g>
      </g>
      
      <text :x="SVG_WIDTH / 2" :y="SVG_HEIGHT - 12" fill="#9ca3af" font-size="10" text-anchor="middle">中国地图</text>
    </svg>
  </div>
</template>