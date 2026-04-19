package com.example.orderms.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.orderms.common.BusinessException;
import com.example.orderms.dto.OrderQueryParam;
import com.example.orderms.dto.OrderRequest;
import com.example.orderms.dto.OrderVO;
import com.example.orderms.entity.Customer;
import com.example.orderms.entity.Equipment;
import com.example.orderms.entity.Order;
import com.example.orderms.mapper.CustomerMapper;
import com.example.orderms.mapper.EquipmentMapper;
import com.example.orderms.mapper.OrderMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderServiceImpl {

    private final OrderMapper orderMapper;
    private final CustomerMapper customerMapper;
    private final EquipmentMapper equipmentMapper;

    /** 分页查询订单列表 */
    public Map<String, Object> page(OrderQueryParam param) {
        Page<OrderVO> page = new Page<>(param.getPage(), param.getSize());
        orderMapper.selectOrderPage(page, param);
        return Map.of(
                "records", page.getRecords(),
                "total",   page.getTotal(),
                "page",    page.getCurrent(),
                "size",    page.getSize()
        );
    }

    /** 获取订单详情（含客户联系方式、设备规格） */
    public OrderVO detail(Long id) {
        OrderVO vo = orderMapper.selectOrderDetail(id);
        if (vo == null) {
            throw new BusinessException("订单不存在");
        }
        return vo;
    }

    /**
     * 新增订单
     * 业务规则：
     * 1. 客户、设备必须存在且状态正常
     * 2. 交货日期不能早于今天
     * 3. 同客户+同设备当日不可重复下单
     */
    @Transactional
    public OrderVO create(OrderRequest req, Long userId) {
        validateOrderRequest(req, null);

        Order order = new Order();
        order.setOrderNo(generateOrderNo());
        copyFromRequest(order, req);
        order.setStatus("PENDING");
        order.setCreateBy(userId);

        orderMapper.insert(order);
        log.info("新增订单: {}", order.getOrderNo());
        return orderMapper.selectOrderDetail(order.getId());
    }

    /**
     * 编辑订单（仅 PENDING 状态可编辑）
     */
    @Transactional
    public OrderVO update(Long id, OrderRequest req) {
        Order order = getOrderOrFail(id);
        if (!"PENDING".equals(order.getStatus())) {
            throw new BusinessException("仅待审核(PENDING)状态的订单可以编辑");
        }
        validateOrderRequest(req, id);
        copyFromRequest(order, req);
        orderMapper.updateById(order);
        return orderMapper.selectOrderDetail(id);
    }

    /**
     * 审核/取消审核订单
     * 状态流转：PENDING → APPROVED（审核）；APPROVED → PENDING（取消审核）
     */
    @Transactional
    public void changeStatus(Long id, String action) {
        Order order = getOrderOrFail(id);
        switch (action) {
            case "approve" -> {
                if (!"PENDING".equals(order.getStatus())) {
                    throw new BusinessException("只有待审核状态的订单可以审核");
                }
                order.setStatus("APPROVED");
            }
            case "cancel_approve" -> {
                if (!"APPROVED".equals(order.getStatus())) {
                    throw new BusinessException("只有已审核状态的订单可以取消审核");
                }
                order.setStatus("PENDING");
            }
            case "ship" -> {
                if (!"APPROVED".equals(order.getStatus())) {
                    throw new BusinessException("只有已审核订单可以发货");
                }
                order.setStatus("SHIPPED");
            }
            case "complete" -> {
                if (!"SHIPPED".equals(order.getStatus())) {
                    throw new BusinessException("只有已发货订单可以完成");
                }
                order.setStatus("COMPLETED");
            }
            default -> throw new BusinessException("无效的操作: " + action);
        }
        orderMapper.updateById(order);
    }

    /**
     * 批量删除订单（仅 PENDING 状态可删除）
     */
    @Transactional
    public void delete(List<Long> ids) {
        for (Long id : ids) {
            Order order = getOrderOrFail(id);
            if (!"PENDING".equals(order.getStatus())) {
                throw new BusinessException("订单[" + order.getOrderNo() + "]已审核，无法删除");
            }
        }
        orderMapper.deleteBatchIds(ids);
        log.info("删除订单 IDs: {}", ids);
    }

    // ---- 私有方法 ----

    private void validateOrderRequest(OrderRequest req, Long excludeOrderId) {
        // 校验客户存在且状态正常
        Customer customer = customerMapper.selectById(req.getCustomerId());
        if (customer == null || customer.getStatus() != 1) {
            throw new BusinessException("客户不存在或已禁用");
        }

        // 校验设备存在且状态正常
        Equipment equipment = equipmentMapper.selectById(req.getEquipmentId());
        if (equipment == null || equipment.getStatus() != 1) {
            throw new BusinessException("设备不存在或已停用");
        }

        // 校验交货日期不早于今天
        if (req.getDeliveryDate().isBefore(LocalDate.now())) {
            throw new BusinessException("交货日期不能早于今天");
        }

        // 校验同客户+同设备当日不重复下单
        int count = orderMapper.countDuplicateOrder(
                req.getCustomerId(), req.getEquipmentId(), excludeOrderId
        );
        if (count > 0) {
            throw new BusinessException("该客户与设备组合今日已存在订单，不可重复下单");
        }
    }

    private void copyFromRequest(Order order, OrderRequest req) {
        order.setCustomerId(req.getCustomerId());
        order.setEquipmentId(req.getEquipmentId());
        order.setOrderType(req.getOrderType());
        order.setAmount(req.getAmount());
        order.setDeliveryDate(req.getDeliveryDate());
        order.setRemark(req.getRemark());
    }

    private Order getOrderOrFail(Long id) {
        Order order = orderMapper.selectById(id);
        if (order == null) {
            throw new BusinessException("订单不存在，ID: " + id);
        }
        return order;
    }

    /** 生成订单编号：ORD-20240419-0001 */
    private String generateOrderNo() {
        String date = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        // 查当天最大序号（生产环境建议用 Redis 自增避免并发问题）
        long count = orderMapper.selectCount(
                new LambdaQueryWrapper<Order>()
                        .likeRight(Order::getOrderNo, "ORD-" + date)
        );
        return String.format("ORD-%s-%04d", date, count + 1);
    }
}
