import { Modal, Descriptions, Tag, Typography } from 'antd'
import type { Order } from '../../types'

interface Props {
  visible: boolean
  order: Order | null
  onClose: () => void
}

const STATUS_LABEL: Record<string, string> = {
  PENDING: '待审核', APPROVED: '已审核', SHIPPED: '已发货', COMPLETED: '已完成',
}
const STATUS_COLOR: Record<string, string> = {
  PENDING: 'orange', APPROVED: 'blue', SHIPPED: 'cyan', COMPLETED: 'green',
}

/** 订单详情弹窗：展示完整订单信息，含关联的客户联系方式、设备规格 */
export default function OrderDetailModal({ visible, order, onClose }: Props) {
  if (!order) return null

  return (
    <Modal
      title={`订单详情 - ${order.orderNo}`}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={680}
    >
      <Descriptions bordered column={2} size="small">
        <Descriptions.Item label="订单编号" span={2}>
          <Typography.Text copyable>{order.orderNo}</Typography.Text>
        </Descriptions.Item>
        <Descriptions.Item label="订单类型">
          <Tag color={order.orderType === 'PURCHASE' ? 'purple' : 'geekblue'}>
            {order.orderType === 'PURCHASE' ? '采购' : '销售'}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="订单状态">
          <Tag color={STATUS_COLOR[order.status]}>{STATUS_LABEL[order.status]}</Tag>
        </Descriptions.Item>

        {/* 客户信息（含联系方式） */}
        <Descriptions.Item label="客户名称">{order.customerName}</Descriptions.Item>
        <Descriptions.Item label="客户电话">{order.customerPhone || '-'}</Descriptions.Item>

        {/* 设备信息（含规格） */}
        <Descriptions.Item label="设备编号">{order.equipmentCode}</Descriptions.Item>
        <Descriptions.Item label="设备名称">{order.equipmentName}</Descriptions.Item>
        {order.equipmentSpec && (
          <Descriptions.Item label="设备规格" span={2}>{order.equipmentSpec}</Descriptions.Item>
        )}

        <Descriptions.Item label="订单金额">
          ¥ {Number(order.amount).toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
        </Descriptions.Item>
        <Descriptions.Item label="交货日期">{order.deliveryDate}</Descriptions.Item>

        <Descriptions.Item label="备注" span={2}>{order.remark || '无'}</Descriptions.Item>
        <Descriptions.Item label="创建时间">{order.createTime}</Descriptions.Item>
        <Descriptions.Item label="更新时间">{order.updateTime}</Descriptions.Item>
      </Descriptions>
    </Modal>
  )
}
