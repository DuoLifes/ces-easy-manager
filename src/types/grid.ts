/**
 * 网格信息接口
 */
export interface Grid {
  id: number
  tenantId: string
  tenantName?: string
  companyId: string
  companyName?: string
  gridName: string
  creator: string
  createTime: string
  updateTime: string
}

/**
 * 网格查询参数
 */
export interface GridQuery {
  tenantId?: string
  companyId?: string
  gridName?: string
  pageNo?: number
  pageSize?: number
}

/**
 * 网格创建参数
 */
export interface GridCreate {
  tenantId: string
  companyId: string
  gridName: string
  creator: string
}

/**
 * 网格更新参数
 */
export interface GridUpdate {
  id: number
  tenantId: string
  companyId: string
  gridName: string
}
