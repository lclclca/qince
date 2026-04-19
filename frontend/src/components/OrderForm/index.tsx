import { useEffect } from 'react'
import {
  Modal, Form, Select, InputNumber, DatePicker,
  Input, message,
} from 'antd'
import dayjs from 'dayjs'
import { useAppSelector, useAppDispatch } from '../../store/hooks'
import { loadCustomers, loadEquipments } from '../../store/orderSlice'
import { createOrder, updateOrder } from '../../api/order'
import type { Order } from '../../types'

interface Props {
  visible: boolean
  editingOrder: Order | null   // null = 新增，非 null = 编辑
  onClose: () => void
  onSuccess: () => void
}

const { Option } = Select

/**
 * 新增/编辑订单弹窗（复用同一个表单组件，题目要求）
 * AI 辅助：客户-设备联动下拉逻辑（onSearch 触发后端搜索）
 * 自身优化：编辑时回填数据；日期格式处理；金额保留两位小数
 */
export default function OrderFormModal({ visible, editingOrder, onClose, onSuccess }: Props) {
  const [form]       = Form.useForm()
  const dispatch     = useAppDispatch()
  const customers    = useAppSelector(s => s.order.customers)
  const equipments   = useAppSelector(s => s.order.equipments)

  // 弹窗打开时初始化数据
  useEffect(() => {
    if (visible) {
      dispatch(loadCustomers(undefined))
      dispatch(loadEquipments(undefined))

      if (editingOrder) {
        // 编辑模式：回填已有数据
        form.setFieldsValue({
          ...editingOrder,
          deliveryDate: dayjs(editingOrder.deliveryDate),
        })
      } else {
        form.resetFields()
      }
    }
  }, [visible, editingOrder])

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      const payload = {
        ...values,
        deliveryDate: values.deliveryDate.format('YYYY-MM-DD'),
      }
      if (editingOrder) {
        await updateOrder(editingOrder.id, payload)
        message.success('订单更新成功')
      } else {
        await createOrder(payload)
        message.success('订单新增成功')
      }
      onSuccess()
    } catch (e: unknown) {
      // 表单校验失败时 validateFields 会抛出，此处不重复提示
      const err = e as { message?: string }
      if (err?.message) {
        message.error(err.message)
      }
    }
  }

  return (
    <Modal
      title={editingOrder ? '编辑订单' : '新增订单'}
      open={visible}
      onOk={handleSubmit}
      onCancel={onClose}
      okText="保存"
      cancelText="取消"
      width={560}
      destroyOnClose
    >
      <Form form={form} layout="vertical" preserve={false}>
        {/* 客户选择（支持搜索，AI 辅助实现联动下拉） */}
        <Form.Item
          name="customerId"
          label="客户"
          rules={[{ required: true, message: '请选择客户' }]}
        >
          <Select
            showSearch
            placeholder="请选择客户"
            filterOption={false}
            onSearch={(v) => dispatch(loadCustomers(v))}
          >
            {customers.map(c => (
              <Option key={c.id} value={c.id}>{c.name}（{c.contact}）</Option>
            ))}
          </Select>
        </Form.Item>

        {/* 设备选择（仅显示正常可用设备，AI 辅助实现联动下拉） */}
        <Form.Item
          name="equipmentId"
          label="设备"
          rules={[{ required: true, message: '请选择设备' }]}
        >
          <Select
            showSearch
            placeholder="请选择设备（仅显示正常可用设备）"
            filterOption={false}
            onSearch={(v) => dispatch(loadEquipments(v))}
          >
            {equipments.map(e => (
              <Option key={e.id} value={e.id}>
                {e.code} - {e.name}（{e.spec}）
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="orderType" label="订单类型" rules={[{ required: true, message: '请选择订单类型' }]}>
          <Select placeholder="请选择">
            <Option value="PURCHASE">采购</Option>
            <Option value="SALE">销售</Option>
          </Select>
        </Form.Item>

        {/* 金额：最大12位整数+2位小数，非负 */}
        <Form.Item
          name="amount"
          label="订单金额（元）"
          rules={[
            { required: true, message: '请输入订单金额' },
            { type: 'number', min: 0, message: '金额不能为负数' },
          ]}
        >
          <InputNumber
            style={{ width: '100%' }}
            min={0}
            precision={2}
            placeholder="请输入金额"
            formatter={v => `¥ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={v => v!.replace(/¥\s?|(,*)/g, '') as unknown as number}
          />
        </Form.Item>

        {/* 交货日期：不能早于今天 */}
        <Form.Item
          name="deliveryDate"
          label="交货日期"
          rules={[
            { required: true, message: '请选择交货日期' },
            {
              validator: (_, v) =>
                !v || dayjs(v).isBefore(dayjs(), 'day')
                  ? Promise.reject('交货日期不能早于今天')
                  : Promise.resolve(),
            },
          ]}
        >
          <DatePicker
            style={{ width: '100%' }}
            disabledDate={(d) => d && d.isBefore(dayjs(), 'day')}
          />
        </Form.Item>

        <Form.Item name="remark" label="备注">
          <Input.TextArea rows={3} placeholder="可选填写备注信息" maxLength={500} showCount />
        </Form.Item>
      </Form>
    </Modal>
  )
}
