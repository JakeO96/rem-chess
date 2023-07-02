export default class ExpressAPI {
  createUser = async (data: Object): Promise<Response> => {
    const response = await fetch('http://localhost:3001/auth/create-user', {
      method: 'post',
      body: JSON.stringify(data),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    })
    return this.checkStatus(response)
  }

  logUserIn = async (data: object): Promise<Response> => {
    const response = await fetch('http://localhost:3001/auth/login', {
      method: 'post',
      body: JSON.stringify(data),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    })
    return this.checkStatus(response)
  }

  doesEmailExist = async (data: String): Promise<Response> => {
    const response = await fetch('http://localhost:3001/auth/does-email-exist', {
      method: 'post',
      body: JSON.stringify(data),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    })
    return this.checkStatus(response)
  }

  doesUsernameExist = async (data: String): Promise<Response> => {
    const response = await fetch('http://localhost:3001/auth/does-username-exist', {
      method: 'get',
      body: JSON.stringify(data),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    })
    return this.checkStatus(response)
  }

  private checkStatus(response: Response): Response {
    if (response.status >= 200 && response.status < 300) {
        return response;
    } else {
        const error = new MyError(`HTTP Error ${response.statusText}`);
        error.status = response.statusText;
        error.response = response;
        console.log(error);
        throw error;
    }
  }
}

class MyError extends Error {
  status?: string;
  response?: Response;
}