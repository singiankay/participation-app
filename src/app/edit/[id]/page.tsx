"use client";

import { Suspense } from "react";
import EditParticipant from "@/app/components/EditParticipant";
import Loading from "@/app/loading";

export default function EditPage() {
  return (
    <Suspense fallback={<Loading />}>
      <EditParticipant />
    </Suspense>
  );
}
