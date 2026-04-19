import { useState } from 'react'
import { Layout, Menu, Dropdown, Avatar, Button, theme } from 'antd'
import {
  HomeOutlined, TeamOutlined, OrderedListOutlined,
  RiseOutlined, ToolOutlined, MenuFoldOutlined,
  MenuUnfoldOutlined, UserOutlined, LogoutOutlined,
} from '@ant-design/icons'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { clearUser } from '../../store/authSlice'
import { logout } from '../../api/auth'
import './index.css'

const { Header, Sider, Content } = Layout

/** 侧边栏菜单配置（题目要求：系统首页、客户管理、订单管理、销售跟进、设备关联） */
const menuItems = [
  { key: '/',          icon: <HomeOutlined />,         label: '系统首页' },
  { key: '/customers', icon: <TeamOutlined />,          label: '客户管理' },
  { key: '/orders',    icon: <OrderedListOutlined />,   label: '订单管理' },
  { key: '/sales',     icon: <RiseOutlined />,          label: '销售跟进' },
  { key: '/equipment', icon: <ToolOutlined />,          label: '设备关联' },
]

/**
 * 主布局：左侧边栏 + 顶部导航 + 内容区
 * AI 辅助：侧边栏折叠动画、下拉菜单结构
 * 自身修改：路由联动、角色权限控制
 */
export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const navigate  = useNavigate()
  const location  = useLocation()
  const dispatch  = useAppDispatch()
  const user      = useAppSelector(s => s.auth.user)
  const { token: { colorBgContainer } } = theme.useToken()

  const handleLogout = async () => {
    await logout().catch(() => {})   // 退出失败也继续清除本地状态
    dispatch(clearUser())
    navigate('/login', { replace: true })
  }

  const userMenu = {
    items: [
      { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', danger: true },
    ],
    onClick: ({ key }: { key: string }) => {
      if (key === 'logout') handleLogout()
    },
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* 左侧边栏（支持折叠，有 CSS transition 过渡动画） */}
      <Sider
        collapsible
        collapsed={collapsed}
        trigger={null}
        width={220}
        className="app-sider"
      >
        <div className="logo">{collapsed ? 'OMS' : '订单管理系统'}</div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>

      <Layout>
        {/* 顶部导航栏 */}
        <Header style={{ background: colorBgContainer, padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
          />
          {/* 右侧：用户信息 + 退出按钮 */}
          <Dropdown menu={userMenu} placement="bottomRight">
            <div className="user-info">
              <Avatar icon={<UserOutlined />} size="small" />
              <span style={{ marginLeft: 8 }}>
                {user?.realName || user?.username}
                <span className="role-tag">
                  {user?.role === 'ADMIN' ? '管理员' : '操作员'}
                </span>
              </span>
            </div>
          </Dropdown>
        </Header>

        {/* 主内容区（自适应剩余空间） */}
        <Content style={{ margin: '16px', background: colorBgContainer, borderRadius: 8, padding: 16, overflow: 'auto' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
