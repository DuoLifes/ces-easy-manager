import request from '../utils/request'
import type { Company } from '@/types/company'

/**
 * 查询参数接口
 */
interface CompanyQueryParams {
  /** 局点名称，可选 */
  companyName?: string
  /** 运营商ID，可选 */
  tenantId?: number
  /** 当前页码 */
  pageNo: number
  /** 每页记录数 */
  pageSize: number
}

/**
 * 分页响应数据接口
 */
interface PageResult<T> {
  /** 记录列表 */
  records: T[]
  /** 总记录数 */
  total: number
  /** 每页大小 */
  size: number
  /** 当前页码 */
  current: number
  /** 总页数 */
  pages: number
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
 * 获取局点列表数据
 * @param params - 查询参数，包含运营商ID、局点名称和分页信息
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
 * @param data - 局点数据，包含运营商ID、局点名称和描述
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
 * @param data - 局点数据，包含局点ID、运营商ID、局点名称和描述
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
