import request from '../utils/request'

/**
 * 登录参数接口
 */
interface LoginParams {
  username: string
  password: string
}

/**
 * API 响应数据接口
 * @template T - 响应数据的类型
 */
interface ApiResponse {
  code: string
  msg: string
  data: string
}

/**
 * 用户登录
 * @param data - 登录参数，包含用户名和密码
 * @returns Promise<ApiResponse> - 返回登录结果，成功时包含token和权限信息
 */
export const login = (data: LoginParams): Promise<ApiResponse> => {
  return request({
    url: '/ces/sys/account/login',
    method: 'post',
    data,
  })
}
