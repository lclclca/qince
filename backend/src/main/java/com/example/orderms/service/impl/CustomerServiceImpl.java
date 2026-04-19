package com.example.orderms.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.example.orderms.entity.Customer;
import com.example.orderms.mapper.CustomerMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomerServiceImpl {

    private final CustomerMapper customerMapper;

    /**
     * 获取客户列表（前端下拉选择用）
     * @param keyword 模糊搜索关键词（按名称/联系人）
     */
    public List<Customer> listForSelect(String keyword) {
        LambdaQueryWrapper<Customer> wrapper = new LambdaQueryWrapper<Customer>()
                .eq(Customer::getStatus, 1)  // 只返回正常状态的客户
                .orderByAsc(Customer::getName);

        if (StringUtils.hasText(keyword)) {
            // like 条件：name 或 contact 包含关键词（LIKE '%keyword%'）
            wrapper.and(w -> w.like(Customer::getName, keyword)
                              .or().like(Customer::getContact, keyword));
        }
        return customerMapper.selectList(wrapper);
    }
}
