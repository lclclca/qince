package com.example.orderms.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 订单视图对象（View Object）：用于返回给前端，包含关联的客户和设备信息
 * 区别于实体 Order：VO 是专门面向接口响应的数据结构，可以聚合多个表的字段
 */
@Data
public class OrderVO {
    private Long id;
    private String orderNo;
    private Long customerId;
    private String customerName;    // 来自 customer 表
    private String customerPhone;   // 来自 customer 表（详情接口使用）
    private Long equipmentId;
    private String equipmentCode;   // 来自 equipment 表
    private String equipmentName;   // 来自 equipment 表
    private String equipmentSpec;   // 来自 equipment 表（详情接口使用）
    private String orderType;
    private BigDecimal amount;
    private LocalDate deliveryDate;
    private String status;
    private String remark;
    private Long createBy;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
