// src/trpc/index.ts
import { TRPCError } from "@trpc/server";
import { publicProcedure, router } from "./trpc";
import { z } from "zod";
import { db } from "@/db";
import { hash } from "bcryptjs";
import { getEmailTemplate, handleErrorForInitiative, ManualTRPCError } from "@/lib/utils";
import { error } from "console";
import { emailMessages, getMessages } from "@/lib/tips";
import { sendEmail } from "@/lib/sendEmail";

export const appRouter = router({
  emailRegister: publicProcedure
    .input(
      z.object({
        email: z.string(),
        password: z.string(),
        emailCode: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const { email, password, emailCode } = input;

        if (!email || !password || !emailCode) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: getMessages("10012"),
          });
        }

        //邮箱是否已注册
        const user = await db.user.findFirst({
          where: {
            email,
          },
        });

        if (user) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: getMessages("10013"),
          });
        }

        // 验证激活码是否存在
        const emailCodeRecord = await db.activateToken.findFirst({
          where: {
            account: email,
          },
        });

        if (!emailCodeRecord) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: getMessages("10014"),
          });
        }

        // 验证激活码是否过期
        if (emailCodeRecord.expiredAt.getTime() < Date.now()) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: getMessages("10015"),
          });
        }
        // 验证激活码是否正确
        if (emailCodeRecord.code !== emailCode) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: getMessages("10016"),
          });
        }

        const hashedPassword = await hash(password, 10);
        const newUser = await db.user.create({
          data: {
            email,
            password: hashedPassword,
          },
        });
        return { id: newUser.id, email };
      } catch {
        handleErrorForInitiative(error);
      }
    }),

  emailActive: publicProcedure
    .input(z.object({ email: z.string() }))
    .mutation(async ({ input }) => {
      const { email } = input;
      // 创建激活码
      const hashedEmail = await hash(email, 10);
      // 保存激活码=》不存在email就创建，存在就更新
      await db.activateToken.upsert({
        where: {
          account: email,
        },
        create: {
          account: email,
          code: hashedEmail,
          expiredAt: new Date(Date.now() + 1000 * 60 * 60 * 1), // 1小时过期
        },
        update: {
          code: hashedEmail,
          expiredAt: new Date(Date.now() + 1000 * 60 * 60 * 1), // 1小时过期
        },
      });
      // 发送邮件
      await sendEmail({
        to: email,
        subject: "激活邮件",
        text: emailMessages.TEXT,
        html: getEmailTemplate(hashedEmail, email),
      });
      // 返回状态
      return { status: "success" };
    }),

  phoneRegister: publicProcedure
    .input(
      z.object({
        phone: z.string(),
        phoneCode: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const { phone, phoneCode } = input;
      try {
        // 验证参数
        if (!phone || !phoneCode) {
          throw new ManualTRPCError("BAD_REQUEST", getMessages("10012"));
        }
        // 验证手机号码是否已经注册
        const user = await db.user.findFirst({
          where: {
            phone,
          },
        });
        if (user) {
          throw new ManualTRPCError("BAD_REQUEST", getMessages("10021"));
        }
        // 验证手机验证码是否存在
        const phoneCodeRecord = await db.activateToken.findFirst({
          where: {
            account: phone,
          },
        });
        if (!phoneCodeRecord) {
          throw new ManualTRPCError("BAD_REQUEST", getMessages("10022"));
        }
        // 验证手机验证码是否过期
        if (phoneCodeRecord.expiredAt.getTime() < Date.now()) {
          throw new ManualTRPCError("BAD_REQUEST", getMessages("10023"));
        }
        // 验证手机验证码是否正确
        if (phoneCodeRecord.code !== phoneCode) {
          throw new ManualTRPCError("BAD_REQUEST", getMessages("10024"));
        }
        // 创建用户
        const newUser = await db.user.create({
          data: {
            phone,
          },
        });
        return { id: newUser.id, phone };
      } catch (error) {
        handleErrorForInitiative(error);
      }
    }),
  phoneActive: publicProcedure
    .input(z.object({ phone: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const { phone } = input;
        // 手机号码是否已经注册
        const user = await db.user.findFirst({
          where: {
            phone,
          },
        });
        if (user) {
          throw new ManualTRPCError("BAD_REQUEST", getMessages("10021"));
        }
        // 验证频繁发送
        const phoneCodeRecord = await db.activateToken.findFirst({
          where: {
            account: phone,
          },
        });
        if (phoneCodeRecord) {
          if (
            phoneCodeRecord.expiredAt.getTime() >
            Date.now() + 1000 * 60 * 4
          ) {
            return { status: "frequently" };
          }
        }
        // 模拟生成要发送给用户的Code
        const smsCode = String(Math.floor(Math.random() * 900000) + 100000);
        // todo 发送短信
        // 保存验证码=》不存在phone就创建，存在就更新
        if (phoneCodeRecord) {
          // 更新
          await db.activateToken.update({
            where: {
              account: phone,
            },
            data: {
              code: smsCode,
              expiredAt: new Date(Date.now() + 1000 * 60 * 5), // 5分钟过期
            },
          });
        } else {
          // 创建
          await db.activateToken.create({
            data: {
              account: phone,
              code: smsCode,
              expiredAt: new Date(Date.now() + 1000 * 60 * 5), // 5分钟过期
            },
          });
        }
        // 返回状态
        return { status: "success" };
      } catch (error) {
        handleErrorForInitiative(error);
      }
    }),
});

export type AppRouter = typeof appRouter;
