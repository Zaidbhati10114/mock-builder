import Image from "next/image";

export const AppLoader = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center">
        <Image
          src="/logomock.svg"
          alt="Logo"
          width={120}
          height={120}
          className="animate-pulse duration-700"
        />
        <p className="mt-2 text-gray-600">Loading...</p>
      </div>
    </div>
  );
};
