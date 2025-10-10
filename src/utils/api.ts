export const apiCall = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const user = localStorage.getItem('currentUser');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers as Record<string, string>
  };

  if (user) {
    try {
      const userData = JSON.parse(user);
      headers['x-user-id'] = userData.id;
      headers['x-user-role'] = userData.role;
    } catch (e) {
      console.error('Failed to parse user data', e);
    }
  }

  return fetch(url, {
    ...options,
    headers
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
  
  put: async (url: string, data: any) => {
    const response = await apiCall(url, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
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
