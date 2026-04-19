-- ============================================================
-- 测试初始数据
-- ============================================================

-- 用户（密码均为 Admin123! 的 BCrypt 哈希）
INSERT INTO sys_user (username, password, real_name, role) VALUES
('admin',    '$2a$10$7EqJtq98hPqEX7fNZaFWoOe5pqQOqdPQbA3Tt3vLMU9EbFoZbOhXi', '管理员', 'ADMIN'),
('operator', '$2a$10$7EqJtq98hPqEX7fNZaFWoOe5pqQOqdPQbA3Tt3vLMU9EbFoZbOhXi', '操作员', 'OPERATOR')
ON CONFLICT (username) DO NOTHING;

-- 客户
INSERT INTO customer (name, contact, phone, email, address) VALUES
('上海科技有限公司',   '张经理', '13800001111', 'zhang@shtech.com',   '上海市浦东新区张江高科'),
('北京贸易有限公司',   '李总',   '13900002222', 'li@bjtrade.com',     '北京市朝阳区建国路'),
('深圳制造有限公司',   '王工',   '13700003333', 'wang@szmaker.com',   '深圳市龙华区大浪工业园'),
('广州进出口有限公司', '陈总',   '13600004444', 'chen@gzimp.com',     '广州市天河区珠江新城'),
('杭州电商有限公司',   '赵经理', '13500005555', 'zhao@hzecom.com',    '杭州市西湖区文三路')
ON CONFLICT DO NOTHING;

-- 设备
INSERT INTO equipment (code, name, spec, category, status) VALUES
('EQ-001', '数控车床',   'CK6140×1000',  '加工设备', 1),
('EQ-002', '加工中心',   'VMC850',       '加工设备', 1),
('EQ-003', '注塑机',     '海天MA900',    '成型设备', 1),
('EQ-004', '激光切割机', 'IPG 3000W',    '切割设备', 1),
('EQ-005', '三坐标测量机','海克斯康',    '检测设备', 1),
('EQ-006', '旧型冲压机', 'J23-25',       '冲压设备', 0)  -- 故障停用
ON CONFLICT (code) DO NOTHING;

-- 订单（覆盖各种状态）
INSERT INTO orders (order_no, customer_id, equipment_id, order_type, amount, delivery_date, status, remark, create_by)
SELECT
    'ORD-2024-0001', 1, 1, 'PURCHASE', 158000.00, '2024-06-30', 'COMPLETED', '年度采购合同', 1
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE order_no='ORD-2024-0001');

INSERT INTO orders (order_no, customer_id, equipment_id, order_type, amount, delivery_date, status, remark, create_by)
SELECT
    'ORD-2024-0002', 2, 2, 'SALE', 85000.50, '2024-07-15', 'SHIPPED', '二期设备销售', 1
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE order_no='ORD-2024-0002');

INSERT INTO orders (order_no, customer_id, equipment_id, order_type, amount, delivery_date, status, remark, create_by)
SELECT
    'ORD-2024-0003', 3, 3, 'PURCHASE', 230000.00, '2024-08-01', 'APPROVED', '注塑机采购', 1
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE order_no='ORD-2024-0003');

INSERT INTO orders (order_no, customer_id, equipment_id, order_type, amount, delivery_date, status, remark, create_by)
SELECT
    'ORD-2024-0004', 4, 4, 'SALE', 320000.00, '2024-09-10', 'PENDING', '激光切割机销售', 2
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE order_no='ORD-2024-0004');

INSERT INTO orders (order_no, customer_id, equipment_id, order_type, amount, delivery_date, status, remark, create_by)
SELECT
    'ORD-2024-0005', 5, 5, 'PURCHASE', 45000.00, '2024-10-01', 'PENDING', '检测设备采购', 2
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE order_no='ORD-2024-0005');
