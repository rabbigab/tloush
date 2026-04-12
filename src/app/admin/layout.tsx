export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // Admin has its own header inside AdminDashboard — don't render the public Header/Footer
  return <>{children}</>
}
