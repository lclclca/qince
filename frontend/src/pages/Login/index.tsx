import { Form, Input, Button, Card, message } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch } from '../../store/hooks'
import { setUser } from '../../store/authSlice'
import { login } from '../../api/auth'
import type { UserInfo } from '../../types'
import './index.css'

/**
 * 登录页面
 * AI 辅助：Ant Design Form 表单校验写法
 * 自身修改：增加了错误处理和跳转逻辑
 */
export default function LoginPage() {
  const navigate  = useNavigate()
  const dispatch  = useAppDispatch()
  const [form]    = Form.useForm()

  const handleSubmit = async (values: { username: string; password: string }) => {
    try {
      const res = await login(values.username, values.password)
      const userInfo = res.data.data as unknown as UserInfo
      dispatch(setUser(userInfo))
      message.success('登录成功')
      navigate('/', { replace: true })
    } catch {
      // 错误已在 axios 拦截器中显示，此处无需重复提示
    }
  }

  return (
    <div className="login-container">
      <Card className="login-card" title="客户订单管理系统">
        <Form form={form} onFinish={handleSubmit} size="large">
          <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input prefix={<UserOutlined />} placeholder="用户名（admin / operator）" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="密码（Admin123!）" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              登 录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}
