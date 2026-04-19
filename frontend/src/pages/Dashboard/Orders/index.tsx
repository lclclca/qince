import { useEffect, useCallback } from 'react'
import {
  Table, Button, Space, Tag, Popconfirm, Input, Select,
  DatePicker, Row, Col, message, Tooltip, Typography,
} from 'antd'
import {
  PlusOutlined, SearchOutlined, ReloadOutlined,
  EditOutlined, DeleteOutlined, AuditOutlined, EyeOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import {
  fetchOrders, setQueryParam, openModal, closeModal,
  openDetail, closeDetail, setSelectedIds, loadCustomers, loadEquipments,
} from '../../../store/orderSlice'
import type { Order, OrderQueryParam } from '../../../types'
import { changeOrderStatus, deleteOrders } from '../../../api/order'
import OrderFormModal from '../../../components/OrderForm'
import OrderDetailModal from '../../../components/OrderDetail'

const { RangePicker } = DatePicker
const { Option } = Select

/** 订单状态 → 颜色映射 */
const STATUS_COLOR: Record<string, string> = {
  PENDING:   'orange',
  APPROVED:  'blue',
  SHIPPED:   'cyan',
  COMPLETED: 'green',
}
const STATUS_LABEL: Record<string, string> = {
  PENDING: '待审核', APPROVED: '已审核', SHIPPED: '已发货', COMPLETED: '已完成',
}

/**
 * 订单管理页面（核心业务页）
 * AI 辅助：分页/筛选/搜索联动逻辑、Table 列定义结构
 * 自身优化：useCallback 防止子组件不必要重渲染；批量操作逻辑
 */
export default function OrdersPage() {
  const dispatch  = useAppDispatch()
  const { orders, total, loading, queryParam, selectedIds, modalVisible, editingOrder, detailVisible, detailOrder } =
    useAppSelector(s => s.order)
  const role = useAppSelector(s => s.auth.user?.role)
  const isAdmin = role === 'ADMIN'

  // 页面加载时获取数据（也预加载下拉数据缓存）
  useEffect(() => {
    dispatch(fetchOrders(queryParam))
    dispatch(loadCustomers(undefined))
    dispatch(loadEquipments(undefined))
  }, [])  // eslint-disable-line

  /** 查询参数变化时刷新列表 */
  const reload = useCallback((newParam?: Partial<OrderQueryParam>) => {
    const merged = { ...queryParam, ...newParam }
    dispatch(setQueryParam(merged))
    dispatch(fetchOrders(merged))
  }, [queryParam, dispatch])

  /** 审核/取消审核 */
  const handleStatus = async (id: number, action: string) => {
    try {
      await changeOrderStatus(id, action)
      message.success('操作成功')
      reload()
    } catch (e: unknown) {
      const err = e as { message?: string }
      message.error(err?.message || '操作失败')
    }
  }

  /** 删除单条或批量 */
  const handleDelete = async (ids: number[]) => {
    try {
      await deleteOrders(ids)
      message.success(`已删除 ${ids.length} 条订单`)
      reload()
    } catch (e: unknown) {
      const err = e as { message?: string }
      message.error(err?.message || '删除失败')
    }
  }

  const columns: ColumnsType<Order> = [
    {
      title: '订单编号', dataIndex: 'orderNo', width: 160,
      render: (v) => <Typography.Text copyable>{v}</Typography.Text>,
    },
    { title: '客户名称',  dataIndex: 'customerName',  width: 140, ellipsis: true },
    {
      title: '订单类型',  dataIndex: 'orderType',     width: 90,
      render: (v) => <Tag color={v === 'PURCHASE' ? 'purple' : 'geekblue'}>
        {v === 'PURCHASE' ? '采购' : '销售'}
      </Tag>,
    },
    {
      title: '订单金额（元）', dataIndex: 'amount', width: 130,
      render: (v) => `¥ ${Number(v).toLocaleString('zh-CN', { minimumFractionDigits: 2 })}`,
      align: 'right',
    },
    { title: '交货日期', dataIndex: 'deliveryDate', width: 110 },
    { title: '设备编号', dataIndex: 'equipmentCode', width: 110 },
    {
      title: '状态', dataIndex: 'status', width: 90,
      render: (v) => <Tag color={STATUS_COLOR[v]}>{STATUS_LABEL[v]}</Tag>,
    },
    {
      title: '操作', key: 'action', width: 220, fixed: 'right',
      render: (_, record) => (
        <Space size={4}>
          {/* 查看详情：所有人可用 */}
          <Tooltip title="查看详情">
            <Button type="link" size="small" icon={<EyeOutlined />}
              onClick={() => dispatch(openDetail(record))} />
          </Tooltip>

          {/* 编辑：仅 PENDING 可编辑 */}
          {record.status === 'PENDING' && (
            <Tooltip title="编辑">
              <Button type="link" size="small" icon={<EditOutlined />}
                onClick={() => dispatch(openModal(record))} />
            </Tooltip>
          )}

          {/* 审核/取消审核：仅管理员可操作 */}
          {isAdmin && record.status === 'PENDING' && (
            <Popconfirm title="确认审核此订单？" onConfirm={() => handleStatus(record.id, 'approve')}>
              <Button type="link" size="small" icon={<AuditOutlined />}>审核</Button>
            </Popconfirm>
          )}
          {isAdmin && record.status === 'APPROVED' && (
            <Popconfirm title="确认取消审核？" onConfirm={() => handleStatus(record.id, 'cancel_approve')}>
              <Button type="link" size="small" danger>取消审核</Button>
            </Popconfirm>
          )}

          {/* 删除：仅管理员 + PENDING 状态可删除 */}
          {isAdmin && record.status === 'PENDING' && (
            <Popconfirm
              title="确认删除此订单？"
              description="删除后无法恢复"
              onConfirm={() => handleDelete([record.id])}
            >
              <Button type="link" size="small" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ]

  return (
    <div>
      {/* 搜索筛选栏 */}
      <Row gutter={[8, 8]} style={{ marginBottom: 12 }}>
        <Col flex="240px">
          <Input.Search
            placeholder="搜索订单号/客户/设备编号"
            allowClear
            prefix={<SearchOutlined />}
            onSearch={(v) => reload({ keyword: v, page: 1 })}
            onChange={(e) => !e.target.value && reload({ keyword: '', page: 1 })}
          />
        </Col>
        <Col flex="120px">
          <Select placeholder="订单类型" allowClear style={{ width: '100%' }}
            onChange={(v) => reload({ orderType: v, page: 1 })}>
            <Option value="PURCHASE">采购</Option>
            <Option value="SALE">销售</Option>
          </Select>
        </Col>
        <Col flex="140px">
          <Select placeholder="订单状态" allowClear style={{ width: '100%' }}
            onChange={(v) => reload({ status: v, page: 1 })}>
            {Object.entries(STATUS_LABEL).map(([k, v]) => (
              <Option key={k} value={k}>{v}</Option>
            ))}
          </Select>
        </Col>
        <Col flex="260px">
          <RangePicker
            placeholder={['交货日期从', '到']}
            onChange={(_, strs) => reload({
              deliveryStart: strs[0] || undefined,
              deliveryEnd:   strs[1] || undefined,
              page: 1,
            })}
          />
        </Col>
        <Col>
          <Button icon={<ReloadOutlined />} onClick={() => reload({ page: 1, keyword: '', orderType: '', status: '' })}>
            重置
          </Button>
        </Col>
      </Row>

      {/* 操作栏 */}
      <Row justify="space-between" style={{ marginBottom: 8 }}>
        <Col>
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => dispatch(openModal(null))}>
              新增订单
            </Button>
            {isAdmin && selectedIds.length > 0 && (
              <Popconfirm
                title={`确认批量删除 ${selectedIds.length} 条订单？`}
                onConfirm={() => handleDelete(selectedIds)}
              >
                <Button danger icon={<DeleteOutlined />}>
                  批量删除（{selectedIds.length}）
                </Button>
              </Popconfirm>
            )}
          </Space>
        </Col>
        <Col>
          <Typography.Text type="secondary">共 {total} 条记录</Typography.Text>
        </Col>
      </Row>

      {/* 订单列表表格 */}
      <Table<Order>
        rowKey="id"
        columns={columns}
        dataSource={orders}
        loading={loading}
        scroll={{ x: 1100 }}
        rowSelection={isAdmin ? {
          selectedRowKeys: selectedIds,
          // 只允许选择 PENDING 状态（可删除）的行
          getCheckboxProps: (record) => ({ disabled: record.status !== 'PENDING' }),
          onChange: (keys) => dispatch(setSelectedIds(keys as number[])),
        } : undefined}
        pagination={{
          current:   queryParam.page,
          pageSize:  queryParam.size,
          total,
          showSizeChanger: true,
          pageSizeOptions: ['8', '16', '32'],
          showTotal: (t) => `共 ${t} 条`,
          onChange: (page, size) => reload({ page, size }),
        }}
      />

      {/* 新增/编辑弹窗 */}
      <OrderFormModal
        visible={modalVisible}
        editingOrder={editingOrder}
        onClose={() => dispatch(closeModal())}
        onSuccess={() => { dispatch(closeModal()); reload() }}
      />

      {/* 订单详情弹窗 */}
      <OrderDetailModal
        visible={detailVisible}
        order={detailOrder}
        onClose={() => dispatch(closeDetail())}
      />
    </div>
  )
}
