import { AppLoader } from "@/app/_components/AppLoader";
import { SignUp } from "@clerk/nextjs";

const SignUpPage = () => {
  return (
    <div className="flex items-center justify-center h-screen w-full">
      <SignUp forceRedirectUrl={"/dashboard"} />
      {!SignUp && <AppLoader />}
    </div>
  );
};

export default SignUpPage;
