import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const PrivacyPolicy = () => {
  return (
    <Dialog>
      <DialogTrigger className="hover:underline me-4 md:me-6">
        Privacy Policy
      </DialogTrigger>
      <DialogContent className="max-w-lg mt-5 mx-auto p-6 sm:max-w-xl sm:rounded-lg sm:border sm:shadow-lg">
        <DialogHeader>
          <DialogTitle>Privacy Policy</DialogTitle>
        </DialogHeader>
        <DialogDescription className="max-h-[50vh] mt-5 overflow-y-auto space-y-4 pr-[2px] -mr-[17px]">
          <p>
            Welcome to MockBuilder AI. This Privacy Policy explains how we
            collect, use, and share information about you when you use our
            website and services. We are committed to protecting your privacy
            and ensuring that your personal information is handled in a safe and
            responsible manner.
          </p>
          <h3 className="font-semibold">Information We Collect</h3>
          <p>
            <strong>1. Information You Provide to Us</strong>
            <br />
            Account Information: When you sign up for MockBuilder AI, we collect
            personal information such as your name, email address, and payment
            details.
          </p>
          <p>
            <strong>2. Information We Collect Automatically</strong>
            <br />
            Cookies and Tracking Technologies: We use cookies and similar
            technologies to track your activity on our site and improve your
            experience. This may include information such as your IP address,
            browser type, and pages visited.
          </p>
          <p>
            <strong>3. Information from Third Parties</strong>
            <br />
            Authentication Providers: If you choose to sign in via a third-party
            authentication provider (such as Google), we may receive information
            from them, such as your name and email address.
          </p>
          <h3 className="font-semibold">How We Use Your Information</h3>
          <p>
            - To provide and improve our services
            <br />
            - To communicate with you
            <br />
            - To personalize your experience
            <br />- To comply with legal obligations
          </p>
          <h3 className="font-semibold">Sharing Your Information</h3>
          <p>
            We may share your information with third-party service providers, in
            response to legal requests, or in the event of a business transfer.
          </p>
          <h3 className="font-semibold">Your Rights and Choices</h3>
          <p>
            You have the right to access, update, delete your personal
            information, and opt out of promotional communications.
          </p>
          <h3 className="font-semibold">Security</h3>
          <p>
            We take reasonable measures to protect your information, but no
            method of transmission over the Internet is completely secure.
          </p>
          <h3 className="font-semibold">Childrens Privacy</h3>
          <p>
            MockBuilder AI is not intended for individuals under the age of 13.
            We do not knowingly collect personal information from children under
            13.
          </p>
          <h3 className="font-semibold">Changes to This Privacy Policy</h3>
          <p>
            We may update this Privacy Policy from time to time. Your continued
            use of MockBuilder AI after the changes have been made will
            constitute your acceptance of the new Privacy Policy.
          </p>
          <p>
            If you have any questions or concerns about this Privacy Policy,
            please contact us at support@mockbuilderai.com.
          </p>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
};

export default PrivacyPolicy;
