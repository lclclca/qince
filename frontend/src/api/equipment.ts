import request from './axios'

export const getEquipments = (keyword?: string, onlyAvailable = true) =>
  request.get('/equipment', { params: { keyword, onlyAvailable } })
