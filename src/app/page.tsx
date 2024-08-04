import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <MaxWidthWrapper className="mb-12 mt-28 sm:mt-40 flex flex-col items-center justify-center text-center">
      <Link
        className={buttonVariants({
          size: "lg",
          className: "mt-5",
        })}
        href="/dashboard"
      >
        Get started <ArrowRight className="ml-2 h-5 w-5" />
      </Link>
      <Button className="mt-4">Click me</Button>
    </MaxWidthWrapper>
  );
}
