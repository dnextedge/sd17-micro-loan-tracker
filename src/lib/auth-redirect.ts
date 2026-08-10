const ALLOWED_PATH = /^\/(?!\/)[A-Za-z0-9/_?=&%.-]*$/;

export function safeNextPath(value: string | null, fallback = "/dashboard") {
  return value && ALLOWED_PATH.test(value) ? value : fallback;
}
