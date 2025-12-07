import React, { Suspense } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import ConnectFacebookCard from "@/components/ConnectFacebookCard";
import ConnectYouTubeCard from "@/components/ConnectYouTubeCard";

export default function DashboardPage() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Suspense fallback={<Card className="h-full"><CardContent className="p-6"><div className="text-sm text-zinc-500">Loading...</div></CardContent></Card>}>
        <ConnectFacebookCard />
      </Suspense>
      <Suspense fallback={<Card className="h-full"><CardContent className="p-6"><div className="text-sm text-zinc-500">Loading...</div></CardContent></Card>}>
        <ConnectYouTubeCard />
      </Suspense>
      <Card>
        <CardHeader>
          <CardTitle>Content Generator</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-24 flex items-center justify-center text-zinc-400">Coming Soon</div>
        </CardContent>
      </Card>
    </div>
  );
}
