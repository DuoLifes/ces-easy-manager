export interface Company {
  id: number
  tenantId: number //运营商id
  tenantName: string //运营商名称
  name: string //局点名称
  description: string //局点描述
  createTime: string //创建时间
  updateTime: string //更新时间
  operatorName: string //创建人
}
