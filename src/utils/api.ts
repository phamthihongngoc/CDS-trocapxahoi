export const apiCall = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const user = localStorage.getItem('currentUser');

  // Clone headers into a mutable object
  const baseHeaders: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  // Detect FormData to avoid setting Content-Type (browser will set boundary)
  const isForm = typeof FormData !== 'undefined' && options.body instanceof FormData;
  if (!isForm) {
    baseHeaders['Content-Type'] = baseHeaders['Content-Type'] || 'application/json';
  }

  if (user) {
    try {
      const userData = JSON.parse(user);
      baseHeaders['x-user-id'] = userData.id;
      baseHeaders['x-user-role'] = userData.role;
    } catch (e) {
      console.error('Failed to parse user data', e);
    }
  }

  return fetch(url, {
    ...options,
    headers: baseHeaders,
  });
};

const api = {
  get: async (url: string) => {
    const response = await apiCall(url);
    return response.json();
  },
  
  post: async (url: string, data: any) => {
    const response = await apiCall(url, {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return response.json();
  },

  // Post with FormData (multipart). Do not set Content-Type manually.
  postForm: async (url: string, formData: FormData) => {
    const response = await apiCall(url, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Có lỗi xảy ra');
    }
    return response.json();
  },
  
  put: async (url: string, data: any) => {
    const response = await apiCall(url, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    return response.json();
  },

  // Put with FormData (multipart). Do not set Content-Type manually.
  putForm: async (url: string, formData: FormData) => {
    const response = await apiCall(url, {
      method: 'PUT',
      body: formData,
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Có lỗi xảy ra');
    }
    return response.json();
  },
  
  delete: async (url: string) => {
    const response = await apiCall(url, {
      method: 'DELETE'
    });
    return response.json();
  }
};

export default api;
