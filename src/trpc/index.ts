// src/trpc/index.ts
import { TRPCError } from "@trpc/server";
import { publicProcedure, router } from "./trpc";
import { z } from "zod";
import { db } from "@/db";
import { hash } from "bcryptjs";
import { getEmailTemplate, handleErrorForInitiative } from "@/lib/utils";
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
});

export type AppRouter = typeof appRouter;
