import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice'
import orderReducer from './orderSlice'

/**
 * Redux Store：集中管理全局状态
 * - auth：登录信息（持久化到 localStorage）
 * - order：订单模块状态（列表、弹窗、搜索条件等）
 */
export const store = configureStore({
  reducer: {
    auth:  authReducer,
    order: orderReducer,
  },
})

// 导出类型，在组件中使用 TypeScript 类型推断
export type RootState   = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
