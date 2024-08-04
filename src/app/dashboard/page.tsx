// src/app/dashboard/page.tsx
"use client";
import { trpc } from "@/app/_trpc/client";

const DashboardPage = () => {
  const { data } = trpc.test.useQuery();
  return (
    <div>
      <p>Welcome to the dashboard!</p>
      <p>{data}</p>
    </div>
  );
};

export default DashboardPage;
