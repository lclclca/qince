/** 统一 API 响应格式 */
export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
  timestamp: number
}

/** 分页响应 */
export interface PageResult<T> {
  records: T[]
  total: number
  page: number
  size: number
}

/** 用户信息（登录后存入 Redux） */
export interface UserInfo {
  username: string
  realName: string
  role: 'ADMIN' | 'OPERATOR'
  token: string
}

/** 客户 */
export interface Customer {
  id: number
  name: string
  contact: string
  phone: string
  email: string
  address: string
  status: number
}

/** 设备 */
export interface Equipment {
  id: number
  code: string
  name: string
  spec: string
  category: string
  status: number
}

/** 订单状态 */
export type OrderStatus = 'PENDING' | 'APPROVED' | 'SHIPPED' | 'COMPLETED'

/** 订单类型 */
export type OrderType = 'PURCHASE' | 'SALE'

/** 订单（列表 + 详情） */
export interface Order {
  id: number
  orderNo: string
  customerId: number
  customerName: string
  customerPhone?: string
  equipmentId: number
  equipmentCode: string
  equipmentName: string
  equipmentSpec?: string
  orderType: OrderType
  amount: number
  deliveryDate: string
  status: OrderStatus
  remark?: string
  createBy?: number
  createTime: string
  updateTime: string
}

/** 订单新增/编辑请求体 */
export interface OrderFormValues {
  customerId: number
  equipmentId: number
  orderType: OrderType
  amount: number
  deliveryDate: string
  remark?: string
}

/** 订单列表查询参数 */
export interface OrderQueryParam {
  page: number
  size: number
  orderType?: string
  status?: string
  deliveryStart?: string
  deliveryEnd?: string
  keyword?: string
}
