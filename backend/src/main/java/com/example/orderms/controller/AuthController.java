package com.example.orderms.controller;

import com.example.orderms.common.Result;
import com.example.orderms.dto.LoginRequest;
import com.example.orderms.service.impl.AuthServiceImpl;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * 认证接口：登录和退出登录
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthServiceImpl authService;

    /**
     * POST /api/auth/login
     * 接收用户名+密码 → 返回 JWT token 和用户信息
     */
    @PostMapping("/login")
    public Result<?> login(@Valid @RequestBody LoginRequest req) {
        return Result.ok(authService.login(req.getUsername(), req.getPassword()));
    }

    /**
     * POST /api/auth/logout
     * 将 token 加入 Redis 黑名单，实现服务端强制失效
     */
    @PostMapping("/logout")
    public Result<?> logout(HttpServletRequest request) {
        authService.logout(request.getHeader("Authorization"));
        return Result.ok();
    }
}
