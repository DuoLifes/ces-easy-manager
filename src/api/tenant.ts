import request from '../utils/request'

/**
 * 租户(运营商)数据项接口
 */
export interface TenantItem {
  /** 运营商ID */
  id: number
  /** 运营商名称 */
  name: string
}

/**
 * API 响应数据接口
 */
interface ApiResponse<T> {
  /** 状态码，00000表示成功 */
  code: string
  /** 响应消息 */
  msg: string
  /** 响应数据 */
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
