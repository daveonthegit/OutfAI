import { PlanHubShell } from "@/components/plan-hub/plan-hub-shell";

export default function PlanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PlanHubShell>{children}</PlanHubShell>;
}
