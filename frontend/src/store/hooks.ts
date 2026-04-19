import { useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from './index'

// 使用带类型的 hooks，避免每次都要手动写泛型
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector = <T>(selector: (state: RootState) => T) =>
  useSelector<RootState, T>(selector)
