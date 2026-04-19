package com.example.orderms.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 订单实体（对应数据库 orders 表）
 * 注意：Java 关键字冲突，类名用 Order 但表名是 orders，通过 @TableName 指定
 */
@Data
@TableName("orders")
public class Order {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 业务订单编号，如 ORD-2024-0001 */
    private String orderNo;

    private Long customerId;
    private Long equipmentId;

    /** PURCHASE=采购，SALE=销售 */
    private String orderType;

    /** 金额，NUMERIC(12,2) 对应 BigDecimal */
    private BigDecimal amount;

    private LocalDate deliveryDate;

    /**
     * 订单状态流转：PENDING → APPROVED → SHIPPED → COMPLETED
     * 禁止跨状态跳转（如不能直接从 PENDING 到 SHIPPED）
     */
    private String status;

    private String remark;
    private Long createBy;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
