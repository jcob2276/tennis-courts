/**
 * asyncHandler to wrapper dla funkcji asynchronicznych w Express.
 * Eliminuje potrzebę pisania bloków try/catch w każdym kontrolerze/trasie.
 * Jeśli funkcja 'fn' rzuci błąd, zostanie on automatycznie złapany i przekazany do next().
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
