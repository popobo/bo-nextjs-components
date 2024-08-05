// src/lib/tips.ts
const messages = {
  "9993": "手机号码格式不正确",
  "9994": "手机验证码格式不正确",
  "9995": "恭喜你发现了宝藏",
  "9996": "ITShareNotes官网注册",
  "9997": "密码必须包含数字、大写字母、小写字母和符号，长度为8 ~ 20个字符",
  "9998": "邮箱激活码必填",
  "9999": "服务端走神了，请联系管理员",
  "10000": "未知错误",
  "10001": "邮箱格式不正确",
  "10002": "两次输入密码不一致",
  "10003": "账号注册",
  "10004": "用户${field}注册成功",
  "10005": "激活邮箱",
  "10006": "激活邮件已发送，请前往邮箱查看",
  "10007": "请输入正确的邮箱，然后激活",
  "10008": "输入邮箱",
  "10009": "输入登录密码",
  "10010": "再次输入登录密码",
  "10011": "输入邮箱激活码",
  "10012": "客户端缺少参数",
  "10013": "邮箱已经注册，请直接登录",
  "10014": "激活码不存在，点击激活获取",
  "10015": "激活码已过期，请重新发送获取",
  "10016": "激活码不正确，请重新输入",
  "10017": "发送邮件失败，请检查邮箱是否正确",
  "10018": "输入手机号码",
  "10019": "输入正确的手机号格式",
  "10020": "输入6位数字验证码",
  "10021": "手机号已经注册，请直接登录",
  "10022": "请先获取验证码",
  "10023": "验证码已过期，请重新发送获取",
  "10024": "验证码不正确，请重新输入",
  "10025": "验证码已发送",
  "10026": "获取验证码操作太频繁，请稍后再试",
  "10027": "输入验证码",
};

export const validatorMessages = {
  email: messages["10001"],
  password: messages["9997"],
  emailCode: messages["9998"],
  phone: messages["9993"],
  phoneCode: messages["9994"],
};

export const emailMessages = {
  SUBJECT: messages["9996"],
  TEXT: messages["9995"],
};

export type TipsCode = keyof typeof messages;

export const getMessages = (code: TipsCode, field?: string) => {
  if (field && messages[code]) return messages[code].replace("${field}", field);
  return messages[code] ? messages[code] : messages["10000"];
};
