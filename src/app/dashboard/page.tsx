import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import ConnectTwitterCard from "@/components/ConnectTwitterCard";

export default function DashboardPage() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <ConnectTwitterCard />
      <Card>
        <CardHeader>
          <CardTitle>Content Generator</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-24 flex items-center justify-center text-zinc-400">Coming Soon</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>History & Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-24 flex items-center justify-center text-zinc-400">Coming Soon</div>
        </CardContent>
      </Card>
    </div>
  );
}
