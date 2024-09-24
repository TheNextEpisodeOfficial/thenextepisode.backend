export class ResponseDto<T> {
  status: number;
  message: string;
  data?: T;
  isToast?: boolean;

  constructor(response: {
    status: number;
    message: string;
    data?: T;
    isToast?: boolean;
  }) {
    this.status = response.status;
    this.message = response.message;
    this.data = response.data;
    this.isToast = response.isToast;
  }
}
