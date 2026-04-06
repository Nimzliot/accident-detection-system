export const assertSupabase = (error, fallbackMessage) => {
  if (error) {
    const nextError = new Error(error.message ?? fallbackMessage);
    nextError.statusCode = 500;
    throw nextError;
  }
};
