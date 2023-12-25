// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const debugLogger = (...callArguments: any[]): void => {
  if (!localStorage.getItem('DEBUG')) {
    return;
  }

  console.info(...callArguments);
};
