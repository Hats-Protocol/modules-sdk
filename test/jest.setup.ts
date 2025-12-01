// Enable BigInt serialization for Jest
// Only define if not already present (forward-compatible)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
if (typeof (BigInt.prototype as any).toJSON !== "function") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (BigInt.prototype as any).toJSON = function () {
    return this.toString();
  };
}
