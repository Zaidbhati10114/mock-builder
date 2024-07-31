import BreadcrumbPageWrapper from "../_components/BreaccrumbPageWrapper";
import Test from "../_components/Test";

const page = () => {
  const dashboardBreadcrumbs = [{ href: "/dashboard", label: "Dashboard" }];
  return (
    <>
      <BreadcrumbPageWrapper breadcrumbs={dashboardBreadcrumbs}>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:px-8">
          <h1>Dashbaord</h1>
        </main>
      </BreadcrumbPageWrapper>
    </>
  );
};

export default page;
