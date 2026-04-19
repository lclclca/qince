-- ============================================================
-- 客户订单管理系统 - PostgreSQL 建表脚本
-- ============================================================

-- 用户表（系统登录账户）
CREATE TABLE IF NOT EXISTS sys_user (
    id          BIGSERIAL PRIMARY KEY,
    username    VARCHAR(50)  NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,          -- BCrypt 加密
    real_name   VARCHAR(50),
    role        VARCHAR(20)  NOT NULL DEFAULT 'OPERATOR', -- ADMIN / OPERATOR
    status      SMALLINT     NOT NULL DEFAULT 1,           -- 1=正常 0=禁用
    create_time TIMESTAMP    NOT NULL DEFAULT NOW(),
    update_time TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- 客户表
CREATE TABLE IF NOT EXISTS customer (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,          -- 客户名称
    contact     VARCHAR(50),                    -- 联系人
    phone       VARCHAR(20),                    -- 联系电话
    email       VARCHAR(100),
    address     TEXT,
    status      SMALLINT     NOT NULL DEFAULT 1, -- 1=正常 0=禁用
    create_time TIMESTAMP    NOT NULL DEFAULT NOW(),
    update_time TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- 设备表
CREATE TABLE IF NOT EXISTS equipment (
    id          BIGSERIAL PRIMARY KEY,
    code        VARCHAR(50)  NOT NULL UNIQUE,   -- 设备编号
    name        VARCHAR(100) NOT NULL,          -- 设备名称
    spec        VARCHAR(200),                   -- 规格型号
    category    VARCHAR(50),                    -- 设备分类
    status      SMALLINT     NOT NULL DEFAULT 1, -- 1=正常可用 0=故障/停用
    create_time TIMESTAMP    NOT NULL DEFAULT NOW(),
    update_time TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- 订单表（核心业务表）
CREATE TABLE IF NOT EXISTS orders (
    id            BIGSERIAL PRIMARY KEY,
    order_no      VARCHAR(30)     NOT NULL UNIQUE,  -- 订单编号，业务唯一标识
    customer_id   BIGINT          NOT NULL REFERENCES customer(id),
    equipment_id  BIGINT          NOT NULL REFERENCES equipment(id),
    order_type    VARCHAR(10)     NOT NULL,          -- PURCHASE=采购 SALE=销售
    amount        NUMERIC(12, 2)  NOT NULL CHECK (amount >= 0),
    delivery_date DATE            NOT NULL,          -- 交货日期
    status        VARCHAR(20)     NOT NULL DEFAULT 'PENDING',
                                                     -- PENDING=待审核
                                                     -- APPROVED=已审核
                                                     -- SHIPPED=已发货
                                                     -- COMPLETED=已完成
    remark        TEXT,
    create_by     BIGINT          REFERENCES sys_user(id),
    create_time   TIMESTAMP       NOT NULL DEFAULT NOW(),
    update_time   TIMESTAMP       NOT NULL DEFAULT NOW()
);

-- 索引：加速常用查询
CREATE INDEX IF NOT EXISTS idx_orders_customer   ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_equipment  ON orders(equipment_id);
CREATE INDEX IF NOT EXISTS idx_orders_status     ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_type       ON orders(order_type);
CREATE INDEX IF NOT EXISTS idx_orders_delivery   ON orders(delivery_date);
-- 复合索引：校验同客户同设备当日不重复下单
CREATE INDEX IF NOT EXISTS idx_orders_cust_equip_date
    ON orders(customer_id, equipment_id, DATE(create_time));
