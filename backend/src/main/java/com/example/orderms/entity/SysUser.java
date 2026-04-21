package com.example.orderms.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * 系统用户实体
 * @TableName 对应数据库表名；@TableId 指定主键策略（AUTO = 自增，对应 PostgreSQL 的 BIGSERIAL）
 */
@Data
@TableName("sys_user")
public class SysUser {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String username;

    /** 存储 BCrypt 加密后的密码（密码保护由 VO 层处理，此处需要参与查询供 Security 认证使用） */
    private String password;

    private String realName;

    /** 角色：ADMIN=管理员，OPERATOR=普通操作员 */
    private String role;

    private Integer status;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
