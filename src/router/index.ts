import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('../views/Home.vue')
    },
    {
      path: '/chat',
      name: 'Chat',
      component: () => import('../views/Chat.vue')
    },
    {
      path: '/biology',
      name: 'Biology',
      component: () => import('../views/Biology.vue')
    },
    {
      path: '/tools',
      name: 'Tools',
      component: () => import('../views/Tools.vue')
    },
    {
      path: '/games',
      name: 'Games',
      component: () => import('../views/Games.vue')
    },
    {
      path: '/album',
      name: 'Album',
      component: () => import('../views/Album.vue')
    },
    {
      path: '/travel',
      name: 'Travel',
      component: () => import('../views/Travel.vue')
    },
    {
      path: '/relationship',
      name: 'Relationship',
      component: () => import('../views/Relationship.vue')
    },
    {
      path: '/anniversary',
      name: 'Anniversary',
      component: () => import('../views/Anniversary.vue')
    },
    {
      path: '/profile',
      name: 'Profile',
      component: () => import('../views/Profile.vue')
    }
  ]
})

export default router
