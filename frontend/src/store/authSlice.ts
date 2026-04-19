import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { UserInfo } from '../types'

interface AuthState {
  user: UserInfo | null
  isLoggedIn: boolean
}

// 从 localStorage 恢复用户信息（实现状态持久化，刷新页面不需要重新登录）
const savedUser = localStorage.getItem('user')
const initialState: AuthState = {
  user: savedUser ? JSON.parse(savedUser) : null,
  isLoggedIn: !!savedUser,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<UserInfo>) {
      state.user = action.payload
      state.isLoggedIn = true
      // 持久化到 localStorage，下次刷新页面自动恢复登录状态
      localStorage.setItem('user', JSON.stringify(action.payload))
    },
    clearUser(state) {
      state.user = null
      state.isLoggedIn = false
      localStorage.removeItem('user')
    },
  },
})

export const { setUser, clearUser } = authSlice.actions
export default authSlice.reducer
