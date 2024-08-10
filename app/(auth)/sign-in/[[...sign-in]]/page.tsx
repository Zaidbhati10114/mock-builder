import { SignIn } from "@clerk/nextjs";

const SignInPage = () => {
  return (
    <div className="flex items-center justify-center h-screen w-full">
      <SignIn fallbackRedirectUrl={"/dashboard"} />
    </div>
  );
};

export default SignInPage;
