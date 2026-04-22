package com.example.orderms.controller;

import com.example.orderms.common.Result;
import com.example.orderms.dto.OrderQueryParam;
import com.example.orderms.dto.OrderRequest;
import com.example.orderms.service.impl.OrderServiceImpl;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 订单管理接口
 * @PreAuthorize 注解实现 RBAC 权限控制（需要 SecurityConfig 中开启 @EnableMethodSecurity）
 */
@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderServiceImpl orderService;

    /**
     * GET /api/orders - 分页查询订单列表（所有登录用户可访问）
     */
    @GetMapping
    public Result<?> page(OrderQueryParam param) {
        return Result.ok(orderService.page(param));
    }

    /**
     * GET /api/orders/{id} - 查询订单详情（含关联信息）
     */
    @GetMapping("/{id}")
    public Result<?> detail(@PathVariable Long id) {
        return Result.ok(orderService.detail(id));
    }

    /**
     * POST /api/orders - 新增订单（普通操作员和管理员均可）
     * @AuthenticationPrincipal 注入当前登录用户，用于记录 createBy
     */
    @PostMapping
    public Result<?> create(@Valid @RequestBody OrderRequest req,
                            @AuthenticationPrincipal UserDetails userDetails) {
        // 此处简化：直接传用户名，生产环境应从数据库查 userId
        // 面试场景：通过用户名查 userId 的代码略去，用 null 代替（DB 允许为空）
        return Result.ok(orderService.create(req, null));
    }

    /**
     * PUT /api/orders/{id} - 编辑订单（仅 PENDING 状态）
     */
    @PutMapping("/{id}")
    public Result<?> update(@PathVariable Long id,
                            @Valid @RequestBody OrderRequest req) {
        return Result.ok(orderService.update(id, req));
    }

    /**
     * PUT /api/orders/{id}/status - 审核/状态变更（仅管理员）
     * Body: {"action": "approve" | "cancel_approve" | "ship" | "complete"}
     */
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<?> changeStatus(@PathVariable Long id,
                                  @RequestBody Map<String, String> body) {
        String action = body.get("action");
        if (action == null || action.isBlank()) {
            return Result.fail("action 参数不能为空");
        }
        orderService.changeStatus(id, action);
        return Result.ok();
    }

    /**
     * DELETE /api/orders - 批量删除（仅 PENDING 状态，仅管理员）
     * Body: {"ids": [1, 2, 3]}
     * 注意：JSON 数字默认被 Jackson 解析为 Integer，需要用 Number 转换为 Long
     */
    @DeleteMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Result<?> delete(@RequestBody Map<String, List<?>> body) {
        List<?> rawIds = body.get("ids");
        if (rawIds == null || rawIds.isEmpty()) {
            return Result.fail("ids 不能为空");
        }
        List<Long> ids = rawIds.stream()
                .map(id -> ((Number) id).longValue())
                .collect(java.util.stream.Collectors.toList());
        orderService.delete(ids);
        return Result.ok();
    }
}
