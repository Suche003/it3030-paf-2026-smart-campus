import API from "./api";

const RESOURCE_URL = "/resources";

export const getAllResources = () => API.get(RESOURCE_URL);

export const getResourceById = (id) => API.get(`${RESOURCE_URL}/${id}`);

export const createResource = (resource) => API.post(RESOURCE_URL, resource);

export const updateResource = (id, resource) =>
  API.put(`${RESOURCE_URL}/${id}`, resource);

export const deleteResource = (id) => API.delete(`${RESOURCE_URL}/${id}`);

export const searchResources = (keyword) =>
  API.get(`${RESOURCE_URL}/search?keyword=${encodeURIComponent(keyword)}`);

export const filterResourcesByLabel = (label) =>
  API.get(`${RESOURCE_URL}/filter/label?label=${encodeURIComponent(label)}`);

export const filterResourcesByType = (type) =>
  API.get(`${RESOURCE_URL}/filter/type?type=${encodeURIComponent(type)}`);

export const filterResourcesByKind = (resourceKind) =>
  API.get(`${RESOURCE_URL}/filter/kind?resourceKind=${encodeURIComponent(resourceKind)}`);

export const getNextResourceCode = (label, resourceKind) =>
  API.get(
    `${RESOURCE_URL}/next-code?label=${encodeURIComponent(label)}&resourceKind=${encodeURIComponent(resourceKind)}`
  );

export const toggleResourceStatus = (id) =>
  API.put(`${RESOURCE_URL}/${id}/toggle-status`);