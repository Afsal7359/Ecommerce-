import axios from 'axios'
import Cookies from 'js-cookie'

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
})

API.interceptors.request.use((config) => {
  const token = Cookies.get('token') || (typeof window !== 'undefined' ? localStorage.getItem('token') : '')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

API.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const msg = err.response?.data?.message || 'Something went wrong'
    if (err.response?.status === 401) {
      Cookies.remove('token')
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        if (!window.location.pathname.startsWith('/login')) window.location.href = '/login'
      }
    }
    return Promise.reject(new Error(msg))
  }
)

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  register:       (data: any)   => API.post('/auth/register', data),
  login:          (data: any)   => API.post('/auth/login', data),
  me:             ()            => API.get('/auth/me'),
  updateProfile:  (data: any)   => API.put('/auth/me', data),
  changePassword: (data: any)   => API.put('/auth/change-password', data),
  forgotPassword: (email: string) => API.post('/auth/forgot-password', { email }),
  resetPassword:  (token: string, password: string) => API.put(`/auth/reset-password/${token}`, { password }),
  wishlist:       (id: string)  => API.post(`/auth/wishlist/${id}`),
}

// ── Products ──────────────────────────────────────────────────────────────────
export const productAPI = {
  list:        (params?: any)          => API.get('/products', { params }),
  featured:    ()                      => API.get('/products/featured'),
  bySlug:      (slug: string)          => API.get(`/products/${slug}`),
  adminList:   (params?: any)          => API.get('/products/admin/all', { params }),
  create:      (data: FormData)        => API.post('/products', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update:      (id: string, data: any) => API.put(`/products/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete:      (id: string)            => API.delete(`/products/${id}`),
  addReview:   (id: string, data: any) => API.post(`/products/${id}/reviews`, data),
  approveReview: (id: string, rid: string) => API.put(`/products/${id}/reviews/${rid}/approve`),
}

// ── Categories ────────────────────────────────────────────────────────────────
export const categoryAPI = {
  list:    ()                               => API.get('/categories'),
  all:     ()                               => API.get('/categories/all'),
  create:  (data: FormData)                 => API.post('/categories', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update:  (id: string, data: FormData)     => API.put(`/categories/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete:  (id: string)                     => API.delete(`/categories/${id}`),
}

// ── Brands ────────────────────────────────────────────────────────────────────
export const brandAPI = {
  list:    ()                               => API.get('/brands'),
  all:     ()                               => API.get('/brands/all'),
  create:  (data: FormData)                 => API.post('/brands', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update:  (id: string, data: FormData)     => API.put(`/brands/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete:  (id: string)                     => API.delete(`/brands/${id}`),
}

// ── Orders ────────────────────────────────────────────────────────────────────
export const orderAPI = {
  create:        (data: any)                => API.post('/orders', data),
  myOrders:      (params?: any)             => API.get('/orders/my', { params }),
  myOrder:       (id: string)               => API.get(`/orders/my/${id}`),
  all:           (params?: any)             => API.get('/orders', { params }),
  byId:          (id: string)               => API.get(`/orders/${id}`),
  updateStatus:  (id: string, data: any)    => API.put(`/orders/${id}/status`, data),
  updatePayment: (id: string, status: string) => API.put(`/orders/${id}/payment`, { status }),
}

// ── Users ─────────────────────────────────────────────────────────────────────
export const userAPI = {
  list:    (params?: any)                   => API.get('/users', { params }),
  byId:    (id: string)                     => API.get(`/users/${id}`),
  update:  (id: string, data: any)          => API.put(`/users/${id}`, data),
  delete:  (id: string)                     => API.delete(`/users/${id}`),
}

// ── Coupons ───────────────────────────────────────────────────────────────────
export const couponAPI = {
  validate: (data: any)                     => API.post('/coupons/validate', data),
  list:     ()                              => API.get('/coupons'),
  create:   (data: any)                     => API.post('/coupons', data),
  update:   (id: string, data: any)         => API.put(`/coupons/${id}`, data),
  delete:   (id: string)                    => API.delete(`/coupons/${id}`),
}

// ── Banners ───────────────────────────────────────────────────────────────────
export const bannerAPI = {
  list:    (position?: string)              => API.get('/banners', { params: { position } }),
  adminList: ()                             => API.get('/banners/admin'),
  create:  (data: FormData)                 => API.post('/banners', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update:  (id: string, data: FormData)     => API.put(`/banners/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete:  (id: string)                     => API.delete(`/banners/${id}`),
}

// ── CMS ───────────────────────────────────────────────────────────────────────
export const cmsAPI = {
  bySlug:  (slug: string)                   => API.get(`/cms/${slug}`),
  list:    ()                               => API.get('/cms'),
  create:  (data: any)                      => API.post('/cms', data),
  update:  (id: string, data: any)          => API.put(`/cms/${id}`, data),
  delete:  (id: string)                     => API.delete(`/cms/${id}`),
}

// ── Enquiries ─────────────────────────────────────────────────────────────────
export const enquiryAPI = {
  submit:  (data: any)                      => API.post('/enquiries', data),
  list:    (params?: any)                   => API.get('/enquiries', { params }),
  update:  (id: string, data: any)          => API.put(`/enquiries/${id}`, data),
}

// ── Analytics ─────────────────────────────────────────────────────────────────
export const analyticsAPI = {
  dashboard:   ()                           => API.get('/analytics/dashboard'),
  salesReport: (params?: any)              => API.get('/analytics/sales-report', { params }),
}

// ── Inventory ─────────────────────────────────────────────────────────────────
export const inventoryAPI = {
  logs:     (params?: any)                  => API.get('/inventory/logs', { params }),
  adjust:   (data: any)                     => API.post('/inventory/adjust', data),
  lowStock: ()                              => API.get('/inventory/low-stock'),
}

export default API
