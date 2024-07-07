export class ResponseDto<T> {
  status: number;
  message: string;
  data: T;

  constructor(response: { status: number; message: string; data?: T }) {
    this.status = response.status;
    this.message = response.message;
    this.data = response.data;
  }
}
