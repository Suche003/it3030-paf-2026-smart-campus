import axios from 'axios'

const API_URL = 'http://localhost:8081/api/resources'

export const getAllResources = () => axios.get(API_URL)

export const getResourceById = (id) => axios.get(`${API_URL}/${id}`)

export const createResource = (resource) => axios.post(API_URL, resource)

export const updateResource = (id, resource) => axios.put(`${API_URL}/${id}`, resource)

export const deleteResource = (id) => axios.delete(`${API_URL}/${id}`)

export const searchResources = (keyword) =>
  axios.get(`${API_URL}/search?keyword=${encodeURIComponent(keyword)}`)

export const filterResourcesByLabel = (label) =>
  axios.get(`${API_URL}/filter/label?label=${encodeURIComponent(label)}`)

export const filterResourcesByType = (type) =>
  axios.get(`${API_URL}/filter/type?type=${encodeURIComponent(type)}`)

export const getNextResourceCode = (label) =>
  axios.get(`${API_URL}/next-code?label=${encodeURIComponent(label)}`)

export const toggleResourceStatus = (id) =>
  axios.put(`${API_URL}/${id}/toggle-status`)