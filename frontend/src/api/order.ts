import request from './axios'
import type { OrderFormValues, OrderQueryParam } from '../types'

/** 分页查询订单列表 */
export const getOrders = (params: OrderQueryParam) =>
  request.get('/orders', { params })

/** 获取订单详情 */
export const getOrderDetail = (id: number) =>
  request.get(`/orders/${id}`)

/** 新增订单 */
export const createOrder = (data: OrderFormValues) =>
  request.post('/orders', data)

/** 编辑订单 */
export const updateOrder = (id: number, data: OrderFormValues) =>
  request.put(`/orders/${id}`, data)

/** 审核/变更订单状态（action: approve | cancel_approve | ship | complete） */
export const changeOrderStatus = (id: number, action: string) =>
  request.put(`/orders/${id}/status`, { action })

/** 批量删除订单 */
export const deleteOrders = (ids: number[]) =>
  request.delete('/orders', { data: { ids } })
