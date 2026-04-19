package com.example.orderms.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.example.orderms.common.BusinessException;
import com.example.orderms.entity.SysUser;
import com.example.orderms.mapper.SysUserMapper;
import com.example.orderms.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl {

    private final AuthenticationManager authManager;
    private final JwtUtil jwtUtil;
    private final SysUserMapper userMapper;
    private final StringRedisTemplate redisTemplate;

    private static final String BLACKLIST_PREFIX = "jwt:blacklist:";

    /**
     * 登录：验证用户名密码 → 生成 JWT
     * Spring Security 的 AuthenticationManager 会调用 UserDetailsServiceImpl
     * 加载用户并通过 BCrypt 比对密码，密码不正确会抛 BadCredentialsException
     */
    public Map<String, Object> login(String username, String password) {
        try {
            authManager.authenticate(
                    new UsernamePasswordAuthenticationToken(username, password)
            );
        } catch (BadCredentialsException e) {
            throw new BusinessException("用户名或密码错误");
        }

        SysUser user = userMapper.selectOne(
                new LambdaQueryWrapper<SysUser>().eq(SysUser::getUsername, username)
        );

        String token = jwtUtil.generateToken(username, user.getRole());
        log.info("用户 [{}] 登录成功，角色: {}", username, user.getRole());

        Map<String, Object> result = new HashMap<>();
        result.put("token", token);
        result.put("username", username);
        result.put("realName", user.getRealName());
        result.put("role", user.getRole());
        return result;
    }

    /**
     * 退出登录：将 token 加入 Redis 黑名单，过期时间与 JWT 一致（24h）
     * 下次请求时 JwtAuthFilter 检查黑名单，阻止使用该 token
     */
    public void logout(String token) {
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        if (token != null && !token.isBlank()) {
            redisTemplate.opsForValue().set(
                    BLACKLIST_PREFIX + token,
                    "1",
                    24, TimeUnit.HOURS
            );
            log.info("token 已加入黑名单");
        }
    }
}
