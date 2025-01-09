const white = []; // 跨域白名单
export const corsOptionsDelegate = (req: Request, callback) => {
  const { url } = req;

  if (white.find((item) => url.startsWith(item))) return callback(null, { origin: true });
  callback(null, { origin: false });
};
