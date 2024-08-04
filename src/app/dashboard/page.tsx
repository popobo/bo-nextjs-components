// src/app/dashboard/page.tsx
"use client";
import { trpc } from "@/app/_trpc/client";
import { Button } from "@/components/ui/button";
import { reactQueryRetry } from "@/lib/utils";

const DashboardPage = () => {
  const { data, isLoading, isFetching } = trpc.test.useQuery(undefined, {
    retry: reactQueryRetry,
  });
  const utils = trpc.useUtils();
  return (
    <div>
      <p>Welcome to the dashboard!</p>
      <p>{data}</p>
      <Button
        onClick={() => {
          utils.test.invalidate();
        }}
      >
        {isFetching || isLoading ? "Loading..." : "Click me"}
      </Button>
    </div>
  );
};

export default DashboardPage;
