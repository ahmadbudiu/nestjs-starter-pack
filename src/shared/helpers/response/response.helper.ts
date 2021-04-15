export class ResponseHelper {
  statusCode = 200;
  data: any;
  error?: string;
  message?: string;

  constructor(response: ResponseHelperInterface) {
    this.data = response.data;
    if (response.statusCode) {
      this.statusCode = response.statusCode;
    }
    if (response.error) {
      this.error = response.error;
    }
    if (response.message) {
      this.message = response.message;
    }
  }

  static create(response: ResponseHelperInterface): ResponseHelper {
    return new ResponseHelper(response);
  }
}

export interface ResponseHelperInterface {
  statusCode?: number;
  data: any;
  error?: string;
  message?: string;
}
