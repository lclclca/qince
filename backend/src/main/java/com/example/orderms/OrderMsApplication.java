package com.example.orderms;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * 客户订单管理系统 - 启动类
 * @MapperScan 告诉 MyBatis-Plus 去哪个包扫描 Mapper 接口（等同于在每个 Mapper 加 @Mapper 注解）
 */
@SpringBootApplication
@MapperScan("com.example.orderms.mapper")
public class OrderMsApplication {
    public static void main(String[] args) {
        SpringApplication.run(OrderMsApplication.class, args);
    }
}
