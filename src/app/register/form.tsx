import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EmailRegister from "@/app/register/EmailRegister";
import PhoneRegister from "@/app/register/PhoneRegister";

const Form = () => {
  return (
    <>
      <div className="text-3xl font-bold text-center mt-10">注册</div>
      <Tabs defaultValue="phone" className="w-full max-w-lg mx-auto p-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="phone">短信注册</TabsTrigger>
          <TabsTrigger value="email">账号注册</TabsTrigger>
        </TabsList>
        <TabsContent value="phone">
          <PhoneRegister />
        </TabsContent>
        <TabsContent value="email">
          <EmailRegister />
        </TabsContent>
      </Tabs>
    </>
  );
};

export default Form;
