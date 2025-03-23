import request from '../utils/request'
import type { Grid, GridQuery, GridCreate, GridUpdate } from '@/types/grid'

/**
 * 分页响应数据接口
 */
interface PageResult<T> {
  /** 记录列表 */
  list: T[]
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
  /** 状态码，200表示成功 */
  code: number
  /** 响应消息 */
  msg: string
  /** 响应数据 */
  data: T
}

/**
 * 获取网格列表数据
 * @param params - 查询参数，包含运营商ID、局点ID、网格名称和分页信息
 * @returns Promise<ApiResponse<PageResult<Grid>>> - 返回网格列表和总数
 */
export const fetchGridData = (params: GridQuery): Promise<ApiResponse<PageResult<Grid>>> => {
  return request({
    url: '/ces/grid/list/page',
    method: 'post',
    data: params,
  })
}

/**
 * 添加网格
 * @param data - 网格数据，包含运营商ID、局点ID和网格名称
 * @returns Promise<ApiResponse<Grid>> - 返回添加结果
 */
export const addGrid = (data: GridCreate): Promise<ApiResponse<Grid>> => {
  return request({
    url: '/ces/grid/add',
    method: 'post',
    data,
  })
}

/**
 * 更新网格
 * @param data - 网格数据，包含网格ID、运营商ID、局点ID和网格名称
 * @returns Promise<ApiResponse<Grid>> - 返回更新结果
 */
export const updateGrid = (data: GridUpdate): Promise<ApiResponse<Grid>> => {
  return request({
    url: '/ces/grid/modify',
    method: 'post',
    data,
  })
}

/**
 * 删除网格
 * @param id - 网格ID
 * @returns Promise<ApiResponse<null>> - 返回删除结果
 */
export const deleteGrid = (id: number): Promise<ApiResponse<null>> => {
  return request({
    url: `/ces/grid/delete/${id}`,
    method: 'delete',
  })
}
