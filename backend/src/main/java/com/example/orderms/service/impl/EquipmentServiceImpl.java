package com.example.orderms.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.example.orderms.entity.Equipment;
import com.example.orderms.mapper.EquipmentMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EquipmentServiceImpl {

    private final EquipmentMapper equipmentMapper;

    /**
     * 获取设备列表（仅正常可用状态，供前端下拉选择）
     * @param keyword 模糊搜索
     * @param onlyAvailable true=只返回 status=1 的设备
     */
    public List<Equipment> listForSelect(String keyword, boolean onlyAvailable) {
        LambdaQueryWrapper<Equipment> wrapper = new LambdaQueryWrapper<Equipment>()
                .orderByAsc(Equipment::getCode);

        if (onlyAvailable) {
            wrapper.eq(Equipment::getStatus, 1);
        }
        if (StringUtils.hasText(keyword)) {
            wrapper.and(w -> w.like(Equipment::getCode, keyword)
                              .or().like(Equipment::getName, keyword));
        }
        return equipmentMapper.selectList(wrapper);
    }
}
