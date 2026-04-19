package com.example.orderms.dto;

import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

/** 订单列表查询参数（分页 + 多条件筛选 + 模糊搜索） */
@Data
public class OrderQueryParam {

    // 分页参数
    private int page = 1;
    private int size = 8;   // 默认每页8条（题目要求）

    // 筛选条件
    private String orderType;    // PURCHASE / SALE
    private String status;       // PENDING / APPROVED / SHIPPED / COMPLETED

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate deliveryStart;   // 交货日期区间开始

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate deliveryEnd;     // 交货日期区间结束

    // 模糊搜索（按订单号/客户名称/设备编号，任意一个匹配即可）
    private String keyword;
}
