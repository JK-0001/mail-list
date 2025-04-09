'use client';

import { signInWithGoogle } from './actions'
import { Mail } from 'lucide-react';
import GoogleButton from 'react-google-button'


export default function ConnectEmail() {

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-full max-w-md px-4 py-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-900/10 mb-6">
            <Mail className="w-8 h-8 text-gray-900" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Connect your email
          </h1>
          <p className="text-sm text-gray-900 text-muted-foreground">
            Choose a provider to continue
          </p>
        </div>

        <div className="flex item-center justify-center">
          <button onClick={signInWithGoogle} className="btn bg-white text-black border-[#e5e5e5] border-[0.5px] hover:bg-gray-200/50">
            <svg aria-label="Google logo" width="16" height="16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><g><path d="m0 0H512V512H0" fill="#fff"></path><path fill="#34a853" d="M153 292c30 82 118 95 171 60h62v48A192 192 0 0190 341"></path><path fill="#4285f4" d="m386 400a140 175 0 0053-179H260v74h102q-7 37-38 57"></path><path fill="#fbbc02" d="m90 341a208 200 0 010-171l63 49q-12 37 0 73"></path><path fill="#ea4335" d="m153 219c22-69 116-109 179-50l55-54c-78-75-230-72-297 55"></path></g></svg>
            Login with Google
          </button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500 text-muted-foreground">
            By continuing, you agree to our{' '}
            <a href="/terms.md" className="text-gray-900 hover:underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy-policy.md" className="text-gray-900 hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}