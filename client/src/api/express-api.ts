import Cookies from "js-cookie";

class MyError extends Error {
  status?: string;
  response?: Response;
  stackTrace?: string;

  constructor(message: string, stackTrace?: string, response?: Response) {
    super(message);
    this.stackTrace = stackTrace;
    this.response = response;
  }
}

export default class ExpressAPI {
  createUser = async (data: Object): Promise<Response> => {
    const options = {
      method: 'post',
      body: JSON.stringify(data),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    }

    const response = await fetch('http://localhost:3001/api/auth/register', options)
    return response
  }

  logUserIn = async (data: object): Promise<Response> => {
    const options = {
      method: 'post',
      body: JSON.stringify(data),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    }
    const response = await fetch('http://localhost:3001/api/auth/login', options)
    return response;
  }

  logUserOut = async (): Promise<Response> => {
    const options = {
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    }
    const response = await this.makeApiCall('http://localhost:3001/api/auth/logout', options);
    return response;
  }

  getLoggedInUsers = async (): Promise<any> => {
    const options = {
      method: 'get',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    }
    const response = await this.makeApiCall('http://localhost:3001/api/user/logged-in', options);
    return response;
  }

  fieldExistsInDB = async (fieldName: string, value: any): Promise<Response> => {
    const options = {
      method: 'get',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    }
    const response = await this.makeApiCall(`http://localhost:3001/api/user/exists/${fieldName}/${value}`, options);
    return response;
  }

  createGame = async (data: object): Promise<Response> => {
    const options = {
      method: 'post',
      body: JSON.stringify(data),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    }
    const response = await fetch('http://localhost:3001/api/game/create-game', options)
    return response;
  }

  private makeApiCall = async (url: string, options: any): Promise<any> => {
    // If there's a token, add it to the request
    const token = Cookies.get('token');
    if (token) {
      options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
      }
    }
    
    const response = await fetch(url, options);
    
    if(response.status === 401) {
      const errorData = await response.json();
      if(errorData.message === 'Session has expired. Please log in again.') {
        // Get the refresh token from the cookie
        const refreshToken = Cookies.get('refreshToken');
        if(refreshToken) {
          // Request a new access token using the refresh token
          const refreshOptions = {
            method: 'post',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${refreshToken}`
            }
          }
          const refreshResponse = await fetch('http://localhost:3001/api/auth/refresh', refreshOptions);
          const refreshData = await refreshResponse.json();
          if(refreshData.accessToken) {
            // Store the new access token and refresh token in cookies
            Cookies.set('token', refreshData.accessToken);
            Cookies.set('refreshToken', refreshData.refreshToken);
            // Retry the original request with the new access token
            options.headers['Authorization'] = `Bearer ${refreshData.accessToken}`;
            return this.makeApiCall(url, options);
          }
        }
      }
      throw new Error(errorData.message);
    }
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }
    
    return response.json();
  }
}