package com.example.orderms.security;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.example.orderms.entity.SysUser;
import com.example.orderms.mapper.SysUserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Spring Security 要求实现 UserDetailsService 来加载用户信息
 * 登录时 Security 框架会调用 loadUserByUsername，我们从数据库查询用户
 */
@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final SysUserMapper userMapper;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        SysUser sysUser = userMapper.selectOne(
                new LambdaQueryWrapper<SysUser>()
                        .eq(SysUser::getUsername, username)
                        .eq(SysUser::getStatus, 1)
        );
        if (sysUser == null) {
            throw new UsernameNotFoundException("用户不存在或已禁用: " + username);
        }
        // Spring Security 用 ROLE_ 前缀约定，这里手动加上
        return new User(
                sysUser.getUsername(),
                sysUser.getPassword(),
                List.of(new SimpleGrantedAuthority("ROLE_" + sysUser.getRole()))
        );
    }
}
