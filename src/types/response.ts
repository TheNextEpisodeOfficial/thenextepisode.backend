export interface Response<T> {
  title?: string;
  message?: string;
  data?: T;
  status?: number;
}
