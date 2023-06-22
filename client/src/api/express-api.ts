export default class ExpressAPI {
  doesUsernameExist = async (): Promise<Response> => {
    const response = await fetch('http://localhost:3001/api/auth', {
      method: 'get',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    })
    return this.checkStatus(response)
  }

  doesUsernameExist2 = async (data: String): Promise<Response> => {
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