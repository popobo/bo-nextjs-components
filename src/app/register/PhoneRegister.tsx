"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { getMessages } from "@/lib/tips";
import { cn } from "@/lib/utils";
import {
  PhoneFormValidator,
  TPhoneFormValidator,
  phoneCodeValidator,
  phoneValidator,
} from "@/lib/validator";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { trpc } from "@/app/_trpc/client";
import { InputEx } from "@/components/ui/input_ex";
function PhoneRegister() {
  const { toast } = useToast();
  const [count, setCount] = useState<number>(60); // 倒计时60秒
  const [isActive, setIsActive] = useState<boolean>(false); // 是否开始倒计时

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isActive && count > 0) {
      timer = setInterval(() => {
        setCount((prevCount) => prevCount - 1);
        if (count === 1) {
          setIsActive(false);
        }
      }, 1000);
    } else if (!isActive && count !== 60) {
      setCount(60);
    }

    return () => {
      clearInterval(timer); // 组件卸载时清除定时器
    };
  }, [isActive, count]);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    setError,
    clearErrors,
    getValues,
    watch,
  } = useForm<TPhoneFormValidator>({
    defaultValues: {},
    resolver: zodResolver(PhoneFormValidator),
  });

  const phone = watch("phone");
  const phoneCode = watch("phoneCode");
  useEffect(() => {
    if (phone && !phoneValidator(phone)) {
      setError("phone", {
        type: "manual",
        message: getMessages("10019"),
      });
    } else {
      clearErrors("phone");
    }

    if (phoneCode && !phoneCodeValidator(phoneCode)) {
      setError("phoneCode", {
        type: "manual",
        message: getMessages("10020"),
      });
    } else {
      clearErrors("phoneCode");
    }
  }, [clearErrors, phone, phoneCode, setError]);

  const { mutate: startPhoneRegister, isLoading: phoneRegisterLoading } =
    trpc.phoneRegister.useMutation({
      onSuccess: (user) => {
        if (user && user.id) {
          toast({
            title: getMessages("10003"),
            description: getMessages("10004", user.phone),
            variant: "default",
          });
        }
      },
      onError: (error) => {
        toast({
          title: getMessages("10003"),
          description: error.message,
          variant: "destructive",
        });
      },
    });
  const { mutate: startPhoneActive, isLoading: phoneActiveLoading } =
    trpc.phoneActive.useMutation({
      onSuccess: (info) => {
        if (info && info.status === "frequently") {
          // 频繁
          setError("phoneCode", {
            message: getMessages("10026"),
          });
          return;
        }
        toast({
          title: getMessages("10003"),
          description: getMessages("10025"),
          variant: "default",
        });
        setIsActive(true);
      },
      onError: (error) => {
        toast({
          title: getMessages("10003"),
          description: error.message,
          variant: "destructive",
        });
      },
    });
  const handleActivePhone = useCallback(() => {
    clearErrors(["phone", "phoneCode"]);
    if (!phoneValidator(phone)) {
      setError("phone", {
        type: "manual",
        message: getMessages("10019"),
      });
      return;
    }
    startPhoneActive({ phone });
  }, [clearErrors, phone, setError, startPhoneActive]);

  const handleSubmitPhone = useCallback(
    ({ phone, phoneCode }: TPhoneFormValidator) => {
      startPhoneRegister({ phone, phoneCode });
    },
    [startPhoneRegister]
  );
  return (
    <Card>
      <CardHeader>
        <CardDescription>未注册手机号验证通过后将自动注册</CardDescription>
      </CardHeader>
      <form
        id="phoneRegister"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(handleSubmitPhone)();
        }}
      >
        <CardContent className="space-y-2">
          <div className="space-y-1">
            <Label className="text-zinc-600" htmlFor="phone">
              手机号：
            </Label>
            <InputEx
              {...register("phone")}
              onBlur={(e) => {
                setValue("phone", e.target.value);
              }}
              className={cn(
                errors.phone && "focus-visible:ring-red-500",
                "pl-12"
              )}
              id="phone"
              placeholder={getMessages("10018")}
              autoComplete="username"
              type="text"
              customprefix={
                <span className="text-zinc-500 text-xs pl-4">+86</span>
              }
            />
            <div className="text-destructive text-xs mt-1">
              {errors.phone ? errors.phone.message : null}
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-zinc-600" htmlFor="phoneCode">
              验证码：
            </Label>
            <div className="flex space-x-2">
              <Input
                {...register("phoneCode")}
                onBlur={(e) => {
                  setValue("phoneCode", e.target.value);
                }}
                className={cn(errors.phoneCode && "focus-visible:ring-red-500")}
                id="phoneCode"
                placeholder={getMessages("10027")}
                autoComplete="off"
                type="text"
              />
              <Button
                onClick={handleActivePhone}
                className="min-w-max text-zinc-500"
                variant={"outline"}
                type="button"
                disabled={isActive || phoneActiveLoading}
              >
                {isActive ? `${count}秒后重发` : "获取验证码"}
              </Button>
            </div>
            <div className="text-destructive text-xs mt-1">
              {errors.phoneCode ? errors.phoneCode.message : null}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            type="submit"
            disabled={phoneRegisterLoading}
          >
            {phoneRegisterLoading && (
              <Loader2 className="mr-4 h-4 w-4 animate-spin text-white" />
            )}
            注册
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

export default PhoneRegister;
