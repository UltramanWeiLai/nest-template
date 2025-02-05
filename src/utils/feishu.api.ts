import axios from 'axios';
import { BusinessException } from '@/exceptions/business/business';
import { loadEnvConfig } from '.';
import { FeishuUser } from '@/interfaces/user/entities/feishu-user.entity';

const { FEISHU_CONFIG } = loadEnvConfig();

// 获取飞书应用授权失败
function isFeishuAuthorizationFails(res: { code: number }, message = '获取飞书应用授权失败') {
  if (res.code !== 0) throw new BusinessException({ code: res.code, message });
}

// 获取飞书应用 access_token
export async function getFeishuAppAccessToken() {
  const { data: res } = await axios.post('https://open.feishu.cn/open-apis/auth/v3/app_access_token/internal', {
    app_id: FEISHU_CONFIG.appid,
    app_secret: FEISHU_CONFIG.appsecret,
  });

  isFeishuAuthorizationFails(res);
  return res['app_access_token'];
}

// 获取飞书用户授权信息
export async function getFeishuUserAccessInfo(code: string, appAccessToken: string) {
  const { data: res } = await axios({
    method: 'POST',
    url: 'https://open.feishu.cn/open-apis/authen/v1/oidc/access_token',
    headers: {
      Authorization: `Bearer ${appAccessToken}`,
      'Content-Type': 'application/json; charset=utf-8',
    },
    data: {
      grant_type: 'authorization_code',
      code,
    },
  });

  isFeishuAuthorizationFails(res, '获取飞书用户授权失败');
  return res.data;
}

// 获取飞书用户信息
export async function getFeishuUserInfo(userAccessToken: string) {
  const { data: res } = await axios({
    method: 'GET',
    url: 'https://open.feishu.cn/open-apis/authen/v1/user_info',
    headers: { Authorization: `Bearer ${userAccessToken}` },
  });

  isFeishuAuthorizationFails(res, '获取飞书用户信息失败');

  const userInfo = new FeishuUser();
  userInfo.userId = res.data['user_id'];
  userInfo.avatarBig = res.data['avatar_big'];
  userInfo.avatarMiddle = res.data['avatar_middle'];
  userInfo.avatarThumb = res.data['avatar_thumb'];
  userInfo.avatarUrl = res.data['avatar_url'];
  userInfo.email = res.data['email'];
  userInfo.enName = res.data['en_name'];
  userInfo.mobile = res.data['mobile'];
  userInfo.name = res.data['name'];
  userInfo.openId = res.data['open_id'];
  userInfo.tenantKey = res.data['tenant_key'];
  userInfo.unionId = res.data['union_id'];

  return userInfo;
}
