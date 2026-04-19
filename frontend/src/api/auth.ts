import request from './axios'
import type { UserInfo } from '../types'

export const login = (username: string, password: string) =>
  request.post<never, { data: { data: UserInfo } }>('/auth/login', { username, password })

export const logout = () =>
  request.post('/auth/logout')
