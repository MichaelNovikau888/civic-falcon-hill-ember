import { createFileRoute } from "@tanstack/react-router";
import { Converter, DeskPending } from "@/components/converter";
import { loadDesk } from "@/lib/fx/desk.functions";

export const Route = createFileRoute("/")({
  loader: () => loadDesk(),
  pendingComponent: DeskPending,
  component: Home,
});

function Home() {
  const data = Route.useLoaderData();
  return <Converter data={data} />;
}
