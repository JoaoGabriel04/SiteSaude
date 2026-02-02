"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginFormData, loginFormSchema } from "@/schemas/loginSchema";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useEffect } from "react";

export default function LoginForm() {
  const router = useRouter();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema),
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(data: LoginFormData) {
    const res = await signIn("credentials", { ...data, redirect: false });
    if (res && res.error) {
      toast.error("Email ou senha incorretos");
      return;
    }
    router.push("/dashboard");
  }

  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      console.log(status); // "authenticated"
      console.log(session?.user);
      console.log(session?.accessToken);
      router.replace("/dashboard");
    }
  }, [status, router]);

  return (
    <main className="w-full flex flex-col items-center">
      <Card className="lg:w-1/4 w-100 flex flex-col items-center space-y-2 py-3 px-4">
        <h1>Login</h1>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full flex flex-col items-center space-y-4"
        >
          <div className="w-full">
            <Label htmlFor="email" className="mb-2">
              Enter your Email
            </Label>
            <div>
              <Input placeholder="Email" {...form.register("email")} />
              {form.formState.errors.email && (
                <p className="text-red-500">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>
          </div>
          <div className="w-full">
            <Label htmlFor="password" className="mb-2">
              Enter your Password
            </Label>
            <div>
              <Input
                type="password"
                placeholder="Password"
                {...form.register("password")}
              />
              {form.formState.errors.password && (
                <p className="text-red-500">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>
          </div>
          <Button disabled={isSubmitting} className="w-3/4 cursor-pointer">
            Login
          </Button>
        </form>
      </Card>
    </main>
  );
}
