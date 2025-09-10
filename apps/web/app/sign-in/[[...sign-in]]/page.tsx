import { SignIn } from "@clerk/nextjs";
import Link from "next/link";

export default function SignInPage() {
  return (
    <div className="h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="border-2 border-dashed border-white px-4 py-2 inline-block rounded-lg mb-4">
            <h1 className="text-xl font-bold font-mono">VANX.CHAT</h1>
          </div>
          <div className="border-b border-dashed border-white w-16 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold font-mono mb-2">WELCOME BACK</h2>
          <p className="text-white text-sm font-mono border border-dashed border-white px-3 py-1 inline-block rounded-md">
            CONTINUE YOUR AI JOURNEY
          </p>
        </div>

        {/* Sign In Form Container */}

        <SignIn redirectUrl="/dashboard" signUpUrl="/sign-up" />

        {/* Help Link */}
        <div className="text-center mt-6">
          <div className="border border-dashed border-white px-3 py-2 rounded-md inline-block">
            <p className="text-xs text-white font-mono">
              NEED HELP?{" "}
              <Link
                href="/support"
                className="underline hover:bg-white hover:text-black px-1 transition-all duration-200"
              >
                CONTACT SUPPORT
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Background Pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-28 h-28 border border-dashed border-white/20 rounded-lg rotate-12"></div>
        <div className="absolute bottom-10 right-10 w-20 h-20 border border-dashed border-white/20 rounded-lg -rotate-12"></div>
        <div className="absolute top-1/3 right-20 w-16 h-16 border border-dashed border-white/10 rounded-lg rotate-45"></div>
        <div className="absolute bottom-1/3 left-20 w-24 h-24 border border-dashed border-white/10 rounded-lg -rotate-45"></div>
        <div className="absolute top-1/2 right-1/2 w-12 h-12 border border-dashed border-white/10 rounded-lg rotate-12"></div>
      </div>
    </div>
  );
}
