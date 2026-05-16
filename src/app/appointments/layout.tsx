/** Portal entity detail layout — inherits AuthShell chrome without control-panel sidebar. */
export default function AppointmentsDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="mx-auto max-w-9xl px-2 py-4 sm:px-4">{children}</div>;
}
