import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { getOrders, getCustomers, getEquipments } from '../api/order'
import { getCustomers as fetchCustomers } from '../api/customer'
import { getEquipments as fetchEquipments } from '../api/equipment'
import type { Order, Customer, Equipment, OrderQueryParam, PageResult } from '../types'

interface OrderState {
  // 订单列表数据
  orders: Order[]
  total: number
  loading: boolean
  // 查询参数（持久化，切换路由回来保持原来的搜索条件）
  queryParam: OrderQueryParam
  // 弹窗状态
  modalVisible: boolean
  editingOrder: Order | null      // null=新增模式，非null=编辑模式
  detailVisible: boolean
  detailOrder: Order | null
  // 下拉数据缓存（避免重复请求）
  customers: Customer[]
  equipments: Equipment[]
  // 选中的行（批量删除用）
  selectedIds: number[]
}

const initialState: OrderState = {
  orders: [],
  total: 0,
  loading: false,
  queryParam: { page: 1, size: 8 },
  modalVisible: false,
  editingOrder: null,
  detailVisible: false,
  detailOrder: null,
  customers: [],
  equipments: [],
  selectedIds: [],
}

/**
 * 异步 Thunk：加载订单列表
 * createAsyncThunk 会自动生成 pending/fulfilled/rejected 三个 action
 * 可以在 extraReducers 中处理这三个状态，实现 loading 管理
 */
export const fetchOrders = createAsyncThunk(
  'order/fetchOrders',
  async (param: OrderQueryParam) => {
    const res = await getOrders(param)
    return res.data.data as PageResult<Order>
  }
)

/** 加载客户下拉数据（带缓存：如果已有数据则不重复请求） */
export const loadCustomers = createAsyncThunk(
  'order/loadCustomers',
  async (keyword: string | undefined, { getState }) => {
    const state = getState() as { order: OrderState }
    // 已有数据且无关键词搜索时，直接复用缓存（AI 辅助优化：避免重复请求）
    if (!keyword && state.order.customers.length > 0) {
      return state.order.customers
    }
    const res = await fetchCustomers(keyword)
    return res.data.data as Customer[]
  }
)

/** 加载设备下拉数据（带缓存） */
export const loadEquipments = createAsyncThunk(
  'order/loadEquipments',
  async (keyword: string | undefined, { getState }) => {
    const state = getState() as { order: OrderState }
    if (!keyword && state.order.equipments.length > 0) {
      return state.order.equipments
    }
    const res = await fetchEquipments(keyword)
    return res.data.data as Equipment[]
  }
)

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    setQueryParam(state, action: PayloadAction<Partial<OrderQueryParam>>) {
      state.queryParam = { ...state.queryParam, ...action.payload }
    },
    openModal(state, action: PayloadAction<Order | null>) {
      state.modalVisible = true
      state.editingOrder = action.payload
    },
    closeModal(state) {
      state.modalVisible = false
      state.editingOrder = null
    },
    openDetail(state, action: PayloadAction<Order>) {
      state.detailVisible = true
      state.detailOrder = action.payload
    },
    closeDetail(state) {
      state.detailVisible = false
      state.detailOrder = null
    },
    setSelectedIds(state, action: PayloadAction<number[]>) {
      state.selectedIds = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending,     (state) => { state.loading = true })
      .addCase(fetchOrders.fulfilled,   (state, action) => {
        state.loading  = false
        state.orders   = action.payload.records
        state.total    = action.payload.total
        state.selectedIds = []
      })
      .addCase(fetchOrders.rejected,    (state) => { state.loading = false })
      .addCase(loadCustomers.fulfilled, (state, action) => { state.customers = action.payload })
      .addCase(loadEquipments.fulfilled,(state, action) => { state.equipments = action.payload })
  },
})

export const {
  setQueryParam, openModal, closeModal,
  openDetail, closeDetail, setSelectedIds,
} = orderSlice.actions
export default orderSlice.reducer
