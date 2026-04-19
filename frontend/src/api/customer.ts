import request from './axios'

export const getCustomers = (keyword?: string) =>
  request.get('/customers', { params: { keyword } })
