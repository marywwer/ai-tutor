export function maybeThrowError() {
  const rand = Math.random();

  if (rand < 0.1) {
    const err = new Error("Unauthorized");
    err.status = 401;
    throw err;
  }

  if (rand < 0.2) {
    const err = new Error("Server error");
    err.status = 500;
    throw err;
  }
}