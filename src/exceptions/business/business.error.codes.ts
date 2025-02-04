export const BUSINESS_ERROR_CODE = {
  // 400 Bad Request - 请求参数错误
  PARAM_INVALID: 400, // 参数验证失败
  PARAM_MISSING: 400, // 缺少必需参数
  PARAM_TYPE_ERROR: 400, // 参数类型错误

  // 401 Unauthorized - 身份认证相关
  UNAUTHORIZED: 401, // 未授权
  TOKEN_INVALID: 401, // 令牌无效
  LOGIN_FAILED: 401, // 登录失败
  INVALID_CREDENTIALS: 401, // 凭证无效
  ACCOUNT_NOT_EXIST: 401, // 账号不存在

  // 403 Forbidden - 权限相关
  ACCESS_FORBIDDEN: 403, // 禁止访问
  PERMISSION_DISABLED: 403, // 权限已禁用
  USER_DISABLED: 403, // 用户已禁用
  RESOURCE_DISABLED: 403, // 资源已禁用

  // 404 Not Found - 资源不存在
  NOT_FOUND: 404, // 未找到
  RESOURCE_NOT_FOUND: 404, // 请求的资源不存在

  // 409 Conflict - 资源冲突
  ACCOUNT_ALREADY_EXIST: 409, // 账号已存在
  RESOURCE_OCCUPIED: 409, // 资源被占用

  // 422 Unprocessable Entity - 业务逻辑错误
  RESOURCE_STATUS_ERROR: 422, // 资源状态错误
  OPERATION_NOT_SUPPORTED: 422, // 不支持的操作
  OPERATION_RATE_LIMIT: 422, // 操作频率限制

  // 500 Internal Server Error - 服务器内部错误
  COMMON: 500, // 通用错误
  SYSTEM_ERROR: 500, // 系统错误
  DATABASE_ERROR: 500, // 数据库错误
  CACHE_ERROR: 500, // 缓存错误

  // 503 Service Unavailable - 服务不可用
  SERVICE_UNAVAILABLE: 503, // 服务暂时不可用
  OPERATION_TIMEOUT: 503, // 操作超时
  OPERATION_FAILED: 503, // 操作执行失败
};
