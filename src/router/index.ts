import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { usePermissStore } from '../store/permiss'
import Home from '../views/Home.vue'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

// 公共路由，不需要权限控制
const publicRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    meta: {
      title: '登录',
      noAuth: true,
    },
    component: () => import('../views/pages/Login.vue'),
  },
  {
    path: '/403',
    meta: {
      title: '没有权限',
      noAuth: true,
    },
    component: () => import('../views/pages/403.vue'),
  },
  {
    path: '/404',
    meta: {
      title: '找不到页面',
      noAuth: true,
    },
    component: () => import('../views/pages/404.vue'),
  },
  {
    path: '/',
    name: 'Home',
    component: Home,
    redirect: '/company',
    children: [
      {
        path: 'company',
        name: 'company',
        meta: {
          title: '局点管理',
          permiss: '1_1',
        },
        component: () => import('../views/system/Company.vue'),
      },
      {
        path: 'grid',
        name: 'grid',
        meta: {
          title: '网格管理',
          permiss: '1_2',
        },
        component: () => import('../views/system/Grid.vue'),
      },
      // {
      //   path: 'community',
      //   name: 'community',
      //   meta: {
      //     title: '小区管理',
      //     permiss: '1_3',
      //   },
      //   component: () => import('../views/system/Community.vue'),
      // },
      // {
      //   path: 'marketing-group',
      //   name: 'marketingGroup',
      //   meta: {
      //     title: '营销组管理',
      //     permiss: '1_4',
      //   },
      //   component: () => import('../views/system/MarketingGroup.vue'),
      // },
      // {
      //   path: 'role',
      //   name: 'role',
      //   meta: {
      //     title: '角色管理',
      //     permiss: '1_5',
      //   },
      //   component: () => import('../views/system/Role.vue'),
      // },
      // {
      //   path: 'account',
      //   name: 'account',
      //   meta: {
      //     title: '账号管理',
      //     permiss: '1_6',
      //   },
      //   component: () => import('../views/system/account/Account.vue'),
      // },
      // {
      //   path: 'addAccount',
      //   name: 'addAccount',
      //   meta: {
      //     title: '新建账号',
      //     permiss: '1_6_1',
      //     parentPath: '/account',
      //   },
      //   component: () => import('../views/system/account/AddAccount.vue'),
      // },
      // {
      //   path: 'editAccount/:id',
      //   name: 'editAccount',
      //   meta: {
      //     title: '编辑账号',
      //     permiss: '1_6_2',
      //     parentPath: '/account',
      //   },
      //   component: () => import('../views/system/account/EditAccount.vue'),
      // },
      // {
      //   path: 'configAccountRole/:id',
      //   name: 'configAccountRole',
      //   meta: {
      //     title: '角色配置',
      //     permiss: '1_6_3',
      //     parentPath: '/account',
      //   },
      //   component: () => import('../views/system/account/ConfigAccountRole.vue'),
      // },
      // {
      //   path: 'configAccountMarketingGroup/:id',
      //   name: 'configAccountMarketingGroup',
      //   meta: {
      //     title: '营销组配置',
      //     permiss: '1_6_4',
      //     parentPath: '/account',
      //   },
      //   component: () => import('../views/system/account/ConfigAccountMarketingGroup.vue'),
      // },
      // {
      //   path: 'tag',
      //   name: 'tag',
      //   meta: {
      //     title: '标签管理',
      //     permiss: '1_7',
      //   },
      //   component: () => import('../views/system/tag/Tag.vue'),
      // },
      // {
      //   path: 'addTag',
      //   name: 'addTag',
      //   meta: {
      //     title: '新建标签',
      //     permiss: '1_7_1',
      //     parentPath: '/tag',
      //   },
      //   component: () => import('../views/system/tag/AddTag.vue'),
      // },
      // {
      //   path: 'editTag/:id',
      //   name: 'editTag',
      //   meta: {
      //     title: '编辑标签',
      //     permiss: '1_7_2',
      //     parentPath: '/tag',
      //   },
      //   component: () => import('../views/system/tag/EditTag.vue'),
      // },
      // {
      //   path: 'configTagCompany/:id',
      //   name: 'configTagCompany',
      //   meta: {
      //     title: '局点配置',
      //     permiss: '1_7_3',
      //     parentPath: '/tag',
      //   },
      //   component: () => import('../views/system/tag/ConfigTagCompany.vue'),
      // },
      // {
      //   path: 'strategy',
      //   name: 'strategy',
      //   meta: {
      //     title: '策略管理',
      //     permiss: '1_8',
      //   },
      //   component: () => import('../views/system/strategy/Strategy.vue'),
      // },
      // {
      //   path: 'addStrategy',
      //   name: 'addStrategy',
      //   meta: {
      //     title: '新建策略',
      //     permiss: '1_8_1',
      //     parentPath: '/strategy',
      //   },
      //   component: () => import('../views/system/strategy/AddStrategy.vue'),
      // },
      // {
      //   path: 'editStrategy/:id',
      //   name: 'editStrategy',
      //   meta: {
      //     title: '编辑策略',
      //     permiss: '1_8_2',
      //     parentPath: '/strategy',
      //   },
      //   component: () => import('../views/system/strategy/EditStrategy.vue'),
      // },
      // {
      //   path: 'configStrategyCompany/:id',
      //   name: 'configStrategyCompany',
      //   meta: {
      //     title: '局点配置',
      //     permiss: '1_8_3',
      //     parentPath: '/strategy',
      //   },
      //   component: () => import('../views/system/strategy/ConfigStrategyCompany.vue'),
      // },
      // {
      //   path: 'prospect',
      //   name: 'prospect',
      //   meta: {
      //     title: '潜客管理',
      //     permiss: '2_1',
      //   },
      //   component: () => import('../views/dataManager/prospect/Prospect.vue'),
      // },
      // {
      //   path: 'data-allocation',
      //   name: 'data-allocation',
      //   meta: {
      //     title: '数据分配',
      //     permiss: '2_2',
      //   },
      //   component: () => import('../views/dataManager/dataAllocation/DataAllocation.vue'),
      // },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404',
  },
]

// 动态路由，需要根据权限动态添加
export const asyncRoutes: RouteRecordRaw[] = []

const router = createRouter({
  history: createWebHashHistory(),
  routes: publicRoutes,
})

// 根据权限过滤路由
export function filterAsyncRoutes(routes: RouteRecordRaw[], permissions: string[]) {
  const res: RouteRecordRaw[] = []

  routes.forEach((route) => {
    const tmp = { ...route }
    if (hasPermission(permissions, tmp)) {
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, permissions)
      }
      res.push(tmp)
    }
  })

  return res
}

// 判断是否有权限
function hasPermission(permissions: string[], route: RouteRecordRaw) {
  if (route.meta && route.meta.permiss) {
    return permissions.includes(route.meta.permiss as string)
  } else {
    return true
  }
}

// 动态添加路由
export function resetRouter() {
  const newRouter = createRouter({
    history: createWebHashHistory(),
    routes: publicRoutes,
  })
  // @ts-expect-error router.matcher不是公开的API，但在Vue Router中可以这样使用
  router.matcher = newRouter.matcher
}

router.beforeEach((to, from, next) => {
  NProgress.start()
  const token = localStorage.getItem('token')
  const permiss = usePermissStore()

  // 如果访问的是根路径
  if (to.path === '/') {
    if (token) {
      // 已登录，重定向到company页面
      next('/company')
    } else {
      // 未登录，重定向到登录页
      next('/login')
    }
    return
  }

  // 处理其他路由
  if (to.meta?.noAuth) {
    // 不需要认证的页面直接通过
    next()
  } else if (!token) {
    // 需要认证但没有token，跳转到登录页
    next('/login')
  } else {
    // 检查是否有权限访问该路由
    if (to.meta?.permiss && !permiss.key.includes(to.meta.permiss as string)) {
      next('/403')
    } else {
      next()
    }
  }
})

router.afterEach(() => {
  NProgress.done()
})

export default router
