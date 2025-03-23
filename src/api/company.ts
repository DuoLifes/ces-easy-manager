import request from '../utils/request'
import type { Company } from '@/types/company'

/**
 * 查询参数接口
 */
interface CompanyQueryParams {
  companyName?: string
  tenantId?: number
  pageNo: number
  pageSize: number
}

/**
 * 分页响应数据接口
 */
interface PageResult<T> {
  records: T[]
  total: number
  size: number
  current: number
  pages: number
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
 * 获取局点列表数据
 * @param params - 查询参数
 * @returns Promise<ApiResponse<PageResult<Company>>> - 返回局点列表和总数
 */
export const fetchCompanyData = (
  params: CompanyQueryParams,
): Promise<ApiResponse<PageResult<Company>>> => {
  return request({
    url: '/ces/company/list/page',
    method: 'post',
    data: params,
  })
}

/**
 * 添加局点
 * @param data - 局点数据
 * @returns Promise<ApiResponse<Company>> - 返回添加结果
 */
export const addCompany = (data: Partial<Company>): Promise<ApiResponse<Company>> => {
  return request({
    url: '/ces/company/add',
    method: 'post',
    data,
  })
}

/**
 * 更新局点
 * @param data - 局点数据
 * @returns Promise<ApiResponse<Company>> - 返回更新结果
 */
export const updateCompany = (data: Partial<Company>): Promise<ApiResponse<Company>> => {
  return request({
    url: '/ces/company/modify',
    method: 'post',
    data,
  })
}

/**
 * 删除局点
 * @param id - 局点ID
 * @returns Promise<ApiResponse<null>> - 返回删除结果
 */
export const deleteCompany = (id: number): Promise<ApiResponse<null>> => {
  return request({
    url: `/ces/company/delete/${id}`,
    method: 'delete',
  })
}
