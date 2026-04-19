package com.example.orderms.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;

import java.math.BigDecimal;
import java.time.LocalDate;

/** 新增/编辑订单的请求体，包含 JSR380 校验注解 */
@Data
public class OrderRequest {

    @NotNull(message = "客户不能为空")
    private Long customerId;

    @NotNull(message = "设备不能为空")
    private Long equipmentId;

    @NotBlank(message = "订单类型不能为空")
    @Pattern(regexp = "PURCHASE|SALE", message = "订单类型只能为 PURCHASE 或 SALE")
    private String orderType;

    @NotNull(message = "订单金额不能为空")
    @DecimalMin(value = "0", message = "订单金额不能为负数")
    @Digits(integer = 10, fraction = 2, message = "金额格式错误，最多10位整数2位小数")
    private BigDecimal amount;

    @NotNull(message = "交货日期不能为空")
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate deliveryDate;

    private String remark;
}
