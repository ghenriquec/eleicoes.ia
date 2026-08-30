export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return <div className="min-h-screen bg-surface-2">{children}</div>;
}
