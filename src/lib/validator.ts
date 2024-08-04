import { z } from "zod";
import emailValidator from "email-validator";

const passwordSchema = z.string().refine(
  (password) =>
    password.length >= 8 &&
    password.length <= 20 &&
    /\d/.test(password) && // 包含数字
    /[a-z]/.test(password) && // 包含小写字母
    /[A-Z]/.test(password) && // 包含大写字母
    /\W|_/.test(password), // 包含符号
  {
    message: "密码必须包含数字、大写字母、小写字母和符号，长度为8 ~ 20个字符",
  }
);

export const EmailFormValidator = z.object({
  email: z.string().refine((email) => emailValidator.validate(email), {
    message: "邮箱格式不正确",
  }),
  password: passwordSchema,
  confirmPassword: passwordSchema,
  emailCode: z.string().refine((code) => code.length > 0, {
    message: "邮箱激活码必填",
  }),
});

export type TEmailFormValidator = z.infer<typeof EmailFormValidator>;
