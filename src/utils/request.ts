/**
 * HTTP 请求工具
 * 基于 axios 封装，提供统一的请求拦截和响应处理
 */

import axios from 'axios'
import type { AxiosInstance, AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'

/**
 * API 响应数据接口
 * @template T - 响应数据的类型
 */
export interface ApiResponse<T> {
  code: string
  msg: string
  data: T
}

/**
 * 创建 axios 实例
 */
const service: AxiosInstance = axios.create({
  timeout: 5000, // 请求超时时间：5秒
})

/**
 * 请求拦截器
 * 在请求发送前添加认证信息等
 */
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 从 localStorage 获取 token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['accesstoken'] = `Bearer ${token}`
    }
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  },
)

/**
 * 响应拦截器
 * 统一处理响应数据和错误
 */
service.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data
  },
  (error: AxiosError<ApiResponse<unknown>>) => {
    // 获取错误信息
    const message = error.response?.data?.msg || '网络请求失败'
    ElMessage.error(message)

    // 处理 401 未授权错误
    if (error.response?.status === 401) {
      // 清除用户信息
      localStorage.removeItem('token')
      localStorage.removeItem('ms_username')
      localStorage.removeItem('permissions')
      // 跳转到登录页
      router.push('/login')
    }
    return Promise.reject(error)
  },
)

export default service
