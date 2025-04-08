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

        <div className="space-y-3">
          <GoogleButton onClick={signInWithGoogle} />
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500 text-muted-foreground">
            By continuing, you agree to our{' '}
            <a href="#" className="text-gray-900 hover:underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-gray-900 hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}