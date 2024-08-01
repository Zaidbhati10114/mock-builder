import { SignIn } from "@clerk/nextjs";

const SignInPage = () => {
  return (
    <div className="flex items-center justify-center h-screen w-full">
      <SignIn afterSignOutUrl={"/sign-in"} />
    </div>
  );
};

export default SignInPage;
