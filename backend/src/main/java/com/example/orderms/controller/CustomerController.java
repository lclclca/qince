package com.example.orderms.controller;

import com.example.orderms.common.Result;
import com.example.orderms.service.impl.CustomerServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * GET /api/customers - 获取客户列表（供前端下拉选择）
 */
@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerServiceImpl customerService;

    @GetMapping
    public Result<?> list(@RequestParam(required = false) String keyword) {
        return Result.ok(customerService.listForSelect(keyword));
    }
}
