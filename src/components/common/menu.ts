import { Menus } from '@/types/menu'

export const menuData: Menus[] = [
  {
    id: '1',
    title: '系统管理',
    index: '1',
    icon: 'Setting',
    permiss: '1',
    children: [
      {
        id: '1_1',
        pid: '1',
        index: '/company',
        title: '局点管理',
        permiss: '1_1',
      },
      {
        id: '1_2',
        pid: '1',
        index: '/grid',
        title: '网格管理',
        permiss: '1_2',
      },
      {
        id: '1_3',
        pid: '1',
        index: '/community',
        title: '小区管理',
        permiss: '1_3',
      },
      {
        id: '1_4',
        pid: '1',
        index: '/marketing-group',
        title: '营销组管理',
        permiss: '1_4',
      },
      {
        id: '1_5',
        pid: '1',
        index: '/role',
        title: '角色管理',
        permiss: '1_5',
      },
      {
        id: '1_6',
        pid: '1',
        index: '/account',
        title: '账号管理',
        permiss: '1_6',
      },
      {
        id: '1_7',
        pid: '1',
        index: '/tag',
        title: '标签管理',
        permiss: '1_7',
      },
      {
        id: '1_8',
        pid: '1',
        index: '/strategy',
        title: '策略管理',
        permiss: '1_8',
      },
    ],
  },
  {
    id: '2',
    title: 'APP数据管理',
    index: '2',
    icon: 'DataAnalysis',
    permiss: '2',
    children: [
      {
        id: '2_1',
        pid: '2',
        index: '/prospect',
        title: '潜客管理',
        permiss: '2_1',
      },
      {
        id: '2_2',
        pid: '2',
        index: '/data-allocation',
        title: '数据分配',
        permiss: '2_2',
      },
    ],
  },
]
