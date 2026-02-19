import React, { Suspense } from "react";
import SubscriptionsContent from "./SubscriptionsContent";

export default function SubscriptionsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SubscriptionsContent />
    </Suspense>
  );
}
