import { defineStore } from 'pinia'

interface ObjectList {
  [key: string]: string[]
}

export const usePermissStore = defineStore('permiss', {
  state: () => {
    const defaultList: ObjectList = {
      admin: ['0', '1', '1_1', '1_2', '1_3', '1_4', '1_5', '1_6'],
      user: ['0', '1', '1_1', '1_2', '1_3', '1_4', '1_5', '1_6'],
    }

    // 从localStorage中获取用户名和权限信息
    const username = localStorage.getItem('ms_username')
    const savedPermissions = localStorage.getItem('permissions')

    // 如果localStorage中有权限信息，则使用它，否则使用默认权限
    const permissions = savedPermissions
      ? JSON.parse(savedPermissions)
      : username === 'admin'
        ? defaultList.admin
        : defaultList.user

    return {
      key: permissions as string[],
      defaultList,
      isAddRoutes: false,
    }
  },
  actions: {
    handleSet(val: string[]) {
      this.key = val
    },
    setAddRoutes(val: boolean) {
      this.isAddRoutes = val
    },
  },
})
