/**
 * 网格信息接口
 */
export interface Grid {
  id: number
  tenantId: number | string
  tenantName: string
  companyId: number | string
  companyName: string
  gridName: string
  operatorName: string
  createTime: string
  updateTime: string
}

/**
 * 网格查询参数
 */
export interface GridQuery {
  tenantId?: number | string
  companyId?: number | string
  gridName?: string
  pageNo?: number
  pageSize?: number
  name?: string
}

/**
 * 网格创建参数
 */
export interface GridCreate {
  tenantId: string | number
  companyId: string | number
  gridName: string
  creator: string
}

/**
 * 网格更新参数
 */
export interface GridUpdate {
  id: number
  tenantId: string | number
  companyId: string | number
  gridName: string
}
