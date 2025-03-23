import request from '../utils/request'

/**
 * 租户(运营商)返回数据接口
 */
export interface TenantItem {
  id: number
  name: string
}

/**
 * API 响应数据接口
 */
interface ApiResponse<T> {
  code: string
  msg: string
  data: T
}

/**
 * 获取运营商列表
 * @returns Promise<ApiResponse<TenantItem[]>> - 返回运营商列表数据
 */
export const fetchTenantList = (): Promise<ApiResponse<TenantItem[]>> => {
  return request({
    url: '/ces/tenant/list',
    method: 'post',
  })
}
