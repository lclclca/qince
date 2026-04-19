package com.example.orderms.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.orderms.entity.SysUser;

/**
 * BaseMapper 已内置 insert/selectById/updateById/deleteById 等通用方法
 * 无需写任何代码即可完成基础 CRUD，相当于 Oracle 项目中常见的 GenericDAO
 */
public interface SysUserMapper extends BaseMapper<SysUser> {
}
