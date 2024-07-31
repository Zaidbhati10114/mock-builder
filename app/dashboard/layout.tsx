import Breadcrumbs from "../_components/Breadcrumbs";
import AppWrapper from "../AppWrapper";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AppWrapper>
      <div className="">
        <Breadcrumbs />
        {children}
      </div>
    </AppWrapper>
  );
}
