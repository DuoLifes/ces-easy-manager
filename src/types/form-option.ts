export interface FormOption {
  list: FormOptionList[]
  labelWidth?: number | string
  span?: number
}

export interface FormOptionList {
  prop: string
  label: string
  type: string // 'input' | 'select' | 'date' | 'custom-component' 等
  placeholder?: string
  disabled?: boolean
  opts?: { label: string; value: string | number }[]
  format?: string
  activeValue?: string | number | boolean
  inactiveValue?: string | number | boolean
  activeText?: string
  inactiveText?: string
  required?: boolean
  component?: object // 自定义组件
  showAll?: boolean // 是否显示"全部"选项
  componentProps?: Record<string, unknown> // 传递给自定义组件的额外属性
  props?: Record<string, unknown> // 传递给自定义组件的属性
  onInput?: (value: string) => void // 输入框值变化回调
  onChange?: (value: number | string) => void // 选择框值变化回调
}
