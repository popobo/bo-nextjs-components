import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { TRPCClientError } from "@trpc/client";
import { TRPCError } from "@trpc/server";
import { getMessages } from "@/lib/tips";
import { TRPC_ERROR_CODE_KEY } from "@trpc/server/rpc";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function absoluteUrl(path: string) {
  if (typeof window !== "undefined") return path;
  if (process.env.PRO_URL) return `${process.env.PRO_URL}${path}`;
  return `http://localhost:${process.env.PORT ?? 3000}${path}`;
}

const MAX_QUERY_RETRIES = 3;
const SKIPPED_HTTP_CODES = [401, 402, 403, 404];

export const reactQueryRetry = (failureCount: number, error: unknown) => {
  if (
    error instanceof TRPCClientError &&
    SKIPPED_HTTP_CODES.includes(error.shape?.data?.httpStatus ?? 0)
  ) {
    return failureCount < 1;
  }
  return failureCount < MAX_QUERY_RETRIES;
};

export class ManualTRPCError extends TRPCError {
  constructor(code: TRPC_ERROR_CODE_KEY, message?: string) {
    super({
      code: code,
      message: message,
    });
    this.name = "ManualTRPCError";
  }
}

export function handleErrorForInitiative(error: any) {
  if (error instanceof ManualTRPCError) {
    throw error;
  } else {
    throw new ManualTRPCError("INTERNAL_SERVER_ERROR", getMessages("9999"));
  }
}

// src/lib/utils.ts
export function getEmailTemplate(hashedEmail: string, sendEmail: string) {
  const sendInfo = {
    hashedemail: hashedEmail,
    url: process.env.NEXTAUTH_URL,
    domain: process.env.DOMAIN,
    sendEmail: sendEmail,
    a: "您好",
    b: "欢迎您注册为我们的用户，以下是验证秘钥：",
    c: "为了您的安全，秘钥将在24小时后过期。",
    d: "如果不是您本人注册为我们的用户，请安全的忽略该邮件。",
    e: "这个信息是从",
    f: "发出到",
  };
  return `
    <div class="mailMainArea" style="font-size: 14px; font-family: Verdana, 宋体, Helvetica, sans-serif; line-height: 1.66; padding: 8px 10px; margin: 0px; width: 700px;"><table border="0" cellpadding="0" cellspacing="0" class="" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%;">
    <tbody><tr>
      <td style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'; font-size: 14px; vertical-align: top;">&nbsp;</td>
      <td class="" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'; font-size: 14px; vertical-align: top; display: block; Margin: 0 auto; max-width: 540px; padding: 10px; width: 540px;">
        <div class="" style="box-sizing: border-box; display: block; Margin: 0 auto; max-width: 600px; padding: 30px 20px;">
          <span class="" style="color: transparent; display: none; height: 0; max-height: 0; max-width: 0; opacity: 0; overflow: hidden; mso-hide: all; visibility: hidden; width: 0;">Welcome back to Build SaaS with Ethan!</span>
          <table class="" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%; background: #ffffff; border-radius: 8px;">
            <tbody><tr>
              <td class="" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'; font-size: 14px; vertical-align: top; box-sizing: border-box;">
                <table border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%;">
                  <tbody><tr>
                    <td style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'; font-size: 14px; vertical-align: top;">
                      <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'; font-size: 20px; color: #15212A; font-weight: bold; line-height: 24px; margin: 0; margin-bottom: 15px;">${sendInfo.a}</p>
                      <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'; font-size: 16px; color: #3A464C; font-weight: normal; margin: 0; line-height: 24px; margin-bottom: 32px;">${sendInfo.b}</p>
                      <table border="0" cellpadding="0" cellspacing="0" class="" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%; box-sizing: border-box;">
                        <tbody>
                          <tr>
                            <td align="left" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'; font-size: 16px; vertical-align: top; padding-bottom: 35px;">
                              <table border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: auto;">
                                <tbody>
                                  <tr>
                                    <td style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'; font-size: 16px; vertical-align: top; background-color: #3B82F6; border-radius: 5px; text-align: center;"> <p style="display: inline-block; color: #ffffff; background-color: #3B82F6; border: solid 1px #3B82F6; border-radius: 5px; box-sizing: border-box; cursor: pointer; text-decoration: none; font-size: 16px; font-weight: normal; margin: 0; padding: 9px 22px 10px; border-color: #3B82F6;" _act="check_domail">${sendInfo.hashedemail}</p> </td>
                                  </tr>
                                </tbody>
                              </table>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                      <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'; font-size: 16px; color: #3A464C; font-weight: normal; line-height: 24px; margin: 0; margin-bottom: 11px;">${sendInfo.c}</p>
                      <hr>
                    </td>
                  </tr>
                  <tr>
                    <td style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'; font-size: 14px; vertical-align: top; padding-top: 80px;">
                      <p class="" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'; line-height: 16px; font-size: 11px; color: #738A94; font-weight: normal; margin: 0;">${sendInfo.d}</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'; font-size: 14px; vertical-align: top; padding-top: 2px;">
                      <p class="" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'; line-height: 16px; font-size: 11px; color: #738A94; font-weight: normal; margin: 0;">${sendInfo.e}<a target="_blank" class="" href="${sendInfo.url}" style="text-decoration: underline; color: #738A94; font-size: 11px;" _act="check_domail">${sendInfo.domain}</a> ${sendInfo.f} <span style="text-decoration: underline; color: #738A94; font-size: 11px;" _act="check_domail">${sendInfo.sendEmail}</span></p>
                    </td>
                  </tr>
                </tbody></table>
              </td>
            </tr>
          </tbody></table>
        </div>
      </td>
      <td style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'; font-size: 14px; vertical-align: top;">&nbsp;</td>
    </tr>
  </tbody></table></div>
    `;
}
