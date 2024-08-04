"use client";

import { useToast } from "@/components/ui/use-toast";
import { EmailFormValidator, TEmailFormValidator } from "@/lib/validator";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect } from "react";
import { trpc } from "@/app/_trpc/client";
import emailValidator from "email-validator";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

function EmailRegister() {
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    setError,
    clearErrors,
    getValues,
    watch,
  } = useForm<TEmailFormValidator>({
    defaultValues: {},
    resolver: zodResolver(EmailFormValidator),
    mode: "all",
  });

  const confirmPassword = watch("confirmPassword");
  const password = watch("password");

  useEffect(() => {
    if (password && confirmPassword && password !== confirmPassword) {
      setTimeout(() => {
        setError("confirmPassword", {
          type: "manual",
          message: "两次密码输入不一致",
        });
      });
    } else {
      clearErrors("confirmPassword");
    }
  }, [password, confirmPassword, setError, clearErrors]);

  const { mutate: startEmailRegister, isLoading: emailRegisterLoading } =
    trpc.emailRegister.useMutation({
      onSuccess: (user) => {
        if (user && user.id) {
          // 注册成功
          toast({
            title: "账号注册",
            description: "注册成功",
            variant: "default",
          });
        }
      },
      onError: (error) => {
        toast({
          title: "账号注册",
          description: error.message,
          variant: "destructive",
        });
      },
    });

  const handleSubmitEmail = useCallback(
    ({ email, password, confirmPassword, emailCode }: TEmailFormValidator) => {
      if (password !== confirmPassword) {
        setError("confirmPassword", {
          type: "manual",
          message: "两次密码输入不一致",
        });
        return;
      }
      startEmailRegister({ email, password, emailCode });
    },
    [setError, startEmailRegister]
  );

  const { mutate: startActiveEmail, isLoading: emailActiveLoading } =
    trpc.emailActive.useMutation({
      onSuccess: (data) => {
        if (data && data.status === "success") {
          toast({
            title: "激活邮箱",
            description: "激活邮件已发送，请前往邮箱查看",
            variant: "default",
          });
        }
      },
      onError: (error) => {
        toast({
          title: "激活邮箱",
          description: error.message,
          variant: "destructive",
        });
      },
    });

  const handleActiveEmail = useCallback(() => {
    clearErrors("email");
    const email = getValues("email")?.trim();
    if (!email || !emailValidator.validate(email)) {
      setError("email", {
        type: "manual",
        message: "请输入正确的邮箱，然后激活",
      });
      return;
    }
    startActiveEmail({ email });
  }, [clearErrors, getValues, setError, startActiveEmail]);

  return (
    <Card>
      <CardHeader>
        <CardDescription>
          邮箱注册后可绑定手机号登录，先点激活更快获取激活码
        </CardDescription>
      </CardHeader>
      <form
        id="emailRegister"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(handleSubmitEmail)();
        }}
      >
        <CardContent className="space-y-2">
          <div className="space-y-1">
            <Label className="text-zinc-600" htmlFor="email">
              邮箱：
            </Label>
            <div className="flex space-x-2">
              <Input
                {...register("email")}
                onBlur={(e) => {
                  setValue("email", e.target.value);
                }}
                className={cn(errors.email && "focus-visible:ring-red-500")}
                id="email"
                placeholder={"输入邮箱"}
                autoComplete="username"
                type="email"
              />
              <Button
                onClick={handleActiveEmail}
                className="min-w-max text-zinc-500"
                variant={"outline"}
                type="button"
                disabled={emailActiveLoading}
              >
                {emailActiveLoading && (
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                )}
                激活{emailActiveLoading ? "中" : ""}
              </Button>
            </div>

            <div className="text-destructive text-xs mt-1">
              {errors.email ? errors.email.message : null}
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-zinc-600" htmlFor="password">
              密码：
            </Label>
            <Input
              {...register("password")}
              className={cn(errors.password && "focus-visible:ring-red-500")}
              onBlur={(e) => {
                setValue("password", e.target.value);
              }}
              id="password"
              placeholder={"输入登录密码"}
              autoComplete="new-password"
              type="password"
            />
            <div className="text-destructive text-xs mt-1">
              {errors.password ? errors.password.message : null}
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-zinc-600" htmlFor="rePassword">
              确认密码：
            </Label>
            <Input
              {...register("confirmPassword")}
              className={cn(
                errors.confirmPassword && "focus-visible:ring-red-500"
              )}
              onBlur={(e) => {
                setValue("confirmPassword", e.target.value);
              }}
              id="rePassword"
              placeholder={"再次输入登录密码"}
              autoComplete="new-password"
              type="password"
            />
            <div className="text-destructive text-xs mt-1">
              {errors.confirmPassword ? errors.confirmPassword.message : null}
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-zinc-600" htmlFor="emailCode">
              激活码：
            </Label>
            <Textarea
              {...register("emailCode")}
              className={cn(errors.emailCode && "focus-visible:ring-red-500")}
              placeholder={"输入邮箱激活码"}
              onBlur={(e) => {
                setValue("emailCode", e.target.value || "");
              }}
              id="emailCode"
            />
            <div className="text-destructive text-xs mt-1">
              {errors.emailCode ? errors.emailCode.message : null}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            type="submit"
            disabled={emailRegisterLoading}
          >
            {emailRegisterLoading && (
              <Loader2 className="mr-4 h-4 w-4 animate-spin text-white" />
            )}
            注册
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

export default EmailRegister;

{
  /*
在这个 `EmailRegister` 组件中，`useEffect` 钩子的主要作用是实时验证密码和确认密码是否匹配。让我详细解释一下：

1. 监听密码变化：
   ```typescript
   const confirmPassword = watch("confirmPassword");
   const password = watch("password");
   ```
   这里使用 `watch` 函数来监听 "password" 和 "confirmPassword" 字段的变化。

2. `useEffect` 的依赖数组：
   ```typescript
   useEffect(() => {
     // ...
   }, [password, confirmPassword, setError, clearErrors]);
   ```
   这个效果会在 `password`、`confirmPassword`、`setError` 或 `clearErrors` 任何一个发生变化时执行。

3. 密码匹配验证：
   ```typescript
   if (password && confirmPassword && password !== confirmPassword) {
     setTimeout(() => {
       setError("confirmPassword", {
         type: "manual",
         message: "两次密码输入不一致",
       });
     });
   } else {
     clearErrors("confirmPassword");
   }
   ```
   - 如果两个密码字段都有值，并且不匹配，则设置一个错误。
   - 如果密码匹配或任一字段为空，则清除错误。

4. 使用 `setTimeout`：
   这里使用 `setTimeout` 来延迟设置错误。这可能是为了避免在用户正在输入时过早显示错误信息，提供更好的用户体验。

5. 实时验证：
   这个效果允许表单在用户输入时实时进行验证，而不是等到表单提交时才验证。

6. 清理错误：
   当密码匹配或字段为空时，它会清除之前可能设置的任何错误。

这种使用 `useEffect` 的方式非常适合于需要根据多个字段的值进行复杂验证的场景。它允许你创建动态和响应式的表单验证逻辑，提升用户体验。

在 Next.js 的客户端组件中，这种用法是完全合适的。它确保了表单验证逻辑在客户端执行，提供即时反馈，而不需要服务器交互。这对于提高用户体验和减少不必要的服务器负载都很有帮助。
*/
}
