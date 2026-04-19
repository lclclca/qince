import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { message } from 'antd'

/**
 * 创建 Axios 实例，统一配置 baseURL 和超时
 * 所有 API 请求都通过此实例发送，方便统一处理认证和错误
 */
const request = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

// ---- 请求拦截器：自动在请求头加 JWT token ----
request.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const userStr = localStorage.getItem('user')
  if (userStr) {
    const user = JSON.parse(userStr)
    if (user?.token) {
      config.headers.Authorization = `Bearer ${user.token}`
    }
  }
  return config
})

// ---- 响应拦截器：统一错误处理 + 请求重试 ----
request.interceptors.response.use(
  (response) => {
    const data = response.data
    // 业务失败（code !== 200）时抛出，让调用方统一处理
    if (data.code !== 200) {
      message.error(data.message || '请求失败')
      return Promise.reject(new Error(data.message))
    }
    return response
  },
  async (error: AxiosError) => {
    const config = error.config as InternalAxiosRequestConfig & { _retryCount?: number }

    if (error.response?.status === 401) {
      message.error('登录已过期，请重新登录')
      localStorage.removeItem('user')
      window.location.href = '/login'
      return Promise.reject(error)
    }

    if (error.response?.status === 403) {
      message.error('权限不足，无法执行该操作')
      return Promise.reject(error)
    }

    // 请求重试机制：网络错误或 5xx 最多重试 2 次（AI 辅助实现，自身优化了重试间隔）
    config._retryCount = config._retryCount || 0
    if (config._retryCount < 2 && (!error.response || error.response.status >= 500)) {
      config._retryCount += 1
      await new Promise(resolve => setTimeout(resolve, 1000 * config._retryCount!))
      return request(config)
    }

    message.error(error.message || '网络请求失败')
    return Promise.reject(error)
  }
)

export default request
