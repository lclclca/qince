package com.example.orderms.controller;

import com.example.orderms.common.Result;
import com.example.orderms.service.impl.EquipmentServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * GET /api/equipment - 获取设备列表（供前端下拉选择，默认只返回正常可用设备）
 */
@RestController
@RequestMapping("/api/equipment")
@RequiredArgsConstructor
public class EquipmentController {

    private final EquipmentServiceImpl equipmentService;

    @GetMapping
    public Result<?> list(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "true") boolean onlyAvailable
    ) {
        return Result.ok(equipmentService.listForSelect(keyword, onlyAvailable));
    }
}
