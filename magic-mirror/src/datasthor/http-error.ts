export class HttpError extends Error {
  constructor(
    public status: number,
    public statusText: string
  ) {
    super(statusText);
  }
}
