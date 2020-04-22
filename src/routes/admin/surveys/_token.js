import crypto from "crypto";

const { APP_NAME, AUTH_SECRET } = process.env;

export default function token(data) {
  const hash = crypto.createHash("sha256");
  hash.update(`${AUTH_SECRET + APP_NAME}${data}`);
  return hash.digest("hex");
}
