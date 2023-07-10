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

  private makeApiCall = async (url: string, options: any): Promise<any> => {
    try {
      const response = await fetch(url, options);
      if (response.status >= 200 && response.status < 300) {
        return response.json();
      } else {
        const errorData = await response.json(); // This will contain the error details from your Express app
        console.error('Error from API:', errorData);
        throw new MyError(`HTTP Error ${response.status}: ${errorData.message}`, errorData.stackTrace, response);
      }
    } catch (error) {
      console.error('Network error:', error);
      throw error;
    }
  }
}