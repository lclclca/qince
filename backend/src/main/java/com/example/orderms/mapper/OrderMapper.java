package com.example.orderms.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.orderms.dto.OrderQueryParam;
import com.example.orderms.dto.OrderVO;
import com.example.orderms.entity.Order;
import org.apache.ibatis.annotations.Param;

/**
 * 订单 Mapper：基础 CRUD 继承自 BaseMapper；
 * 带多表联查（关联客户名称、设备信息）的分页查询用 XML 文件定义
 */
public interface OrderMapper extends BaseMapper<Order> {

    /**
     * 分页查询订单（关联客户、设备信息）
     * IPage 是 MyBatis-Plus 分页对象，框架自动注入 LIMIT/OFFSET
     */
    IPage<OrderVO> selectOrderPage(@Param("page") Page<OrderVO> page,
                                   @Param("param") OrderQueryParam param);

    /**
     * 查询订单详情（含客户联系方式、设备规格）
     */
    OrderVO selectOrderDetail(@Param("id") Long id);

    /**
     * 校验同客户同设备当日是否已存在订单（新增时用）
     * 排除指定 id 是为了编辑时不误报（编辑时 excludeId 传当前订单 id）
     */
    int countDuplicateOrder(@Param("customerId") Long customerId,
                            @Param("equipmentId") Long equipmentId,
                            @Param("excludeId") Long excludeId);
}
