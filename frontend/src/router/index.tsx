import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { useAppSelector } from '../store/hooks'
import LoginPage from '../pages/Login'
import DashboardLayout from '../pages/Dashboard'
import OrdersPage from '../pages/Dashboard/Orders'

/**
 * 路由守卫：未登录用户重定向到 /login
 * 这是 React Router v6 的写法——用组件包裹来实现权限拦截
 */
function RequireAuth() {
  const isLoggedIn = useAppSelector(s => s.auth.isLoggedIn)
  return isLoggedIn ? <Outlet /> : <Navigate to="/login" replace />
}

/**
 * 角色路由守卫：权限不足时显示 403 提示
 */
function RequireRole({ roles }: { roles: string[] }) {
  const role = useAppSelector(s => s.auth.user?.role)
  if (!role || !roles.includes(role)) {
    return <div style={{ padding: 24, color: 'red' }}>权限不足，无法访问此页面</div>
  }
  return <Outlet />
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    // 需要登录的所有页面都包在 RequireAuth 里
    element: <RequireAuth />,
    children: [
      {
        path: '/',
        element: <DashboardLayout />,
        children: [
          { index: true, element: <Navigate to="/orders" replace /> },
          { path: 'orders',   element: <OrdersPage /> },
          // 其他模块页面可以继续在这里添加
          { path: 'customers', element: <div style={{padding:24}}>客户管理（示例占位）</div> },
          { path: 'sales',     element: <div style={{padding:24}}>销售跟进（示例占位）</div> },
          { path: 'equipment', element: <div style={{padding:24}}>设备关联（示例占位）</div> },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
])
