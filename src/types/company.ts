/**
 * 局点数据接口定义
 */
export interface Company {
  /** 局点ID */
  id: number
  /** 运营商ID */
  tenantId: number
  /** 运营商名称 */
  tenantName: string
  /** 局点名称 */
  name: string
  /** 局点描述 */
  description: string
  /** 创建时间 */
  createTime: string
  /** 更新时间 */
  updateTime: string
  /** 创建人 */
  operatorName: string
}
