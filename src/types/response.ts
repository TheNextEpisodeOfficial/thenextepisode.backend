export interface response<T> {
  title?: string;
  message: string;
  data: T;
  status: number;
}
