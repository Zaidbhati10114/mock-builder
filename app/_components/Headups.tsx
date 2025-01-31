import React from "react";

const Headsup = () => {
  return (
    <div className="rounded-md bg-yellow-50 p-4 shadow-lg text-yellow-700 mt-4">
      <div className="flex items-center space-x-3">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-yellow-500"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm7-4a1 1 0 11-2 0 1 1 0 012 0z"
            clipRule="evenodd"
          />
        </svg>
        <p>
          <strong>Heads up!</strong> This app is in beta version. If you dont
          find any data, try a different topic or refresh the page and try
          again. <br />
          Sometimes the AI models are busy and may not respond immediately.
        </p>
      </div>
    </div>
  );
};

export default Headsup;
