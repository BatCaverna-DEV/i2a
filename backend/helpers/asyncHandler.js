/**
 * Envolve um controller async para que exceções cheguem ao errorHandler
 * sem precisar de try/catch em cada rota.
 */
export default function asyncHandler(fn) {
  return function wrapped(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
