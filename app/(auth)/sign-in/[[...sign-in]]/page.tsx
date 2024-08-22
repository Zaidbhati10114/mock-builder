import { AppLoader } from "@/app/_components/AppLoader";
import { SignIn } from "@clerk/nextjs";

const SignInPage = () => {
  return (
    <div className="flex items-center justify-center h-screen w-full">
      <SignIn fallbackRedirectUrl={"/dashboard"} />
      {!SignIn && <AppLoader />}
    </div>
  );
};

export default SignInPage;
