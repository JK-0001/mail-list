'use client'

import { Toaster, toast } from 'sonner'
import { useEffect } from 'react'

import { handleFeedback } from './action'

const BetaFeedback = () => {

    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        const status = params.get('status')

        if (status === 'success') {
            toast.success('Feedback submitted! 🎉')
        } else if (status === 'betasuccess') {
            toast.success('Feedback submitted! 🎉')
            toast.success("We'll send you an email with a link to access the product. Thank You!")
        } else if (status === 'error') {
            toast.error('Something went wrong. Please try again.')
        }

        // Remove the query param from the URL
        const url = new URL(window.location)
        url.searchParams.delete('status')
        window.history.replaceState({}, '', url)

    }, [])

  return (
    <div>
        <Toaster position="top-right" richColors />
        <form action={handleFeedback} className="space-y-4 max-w-md mx-auto">
            <input
                type="text"
                name="name"
                placeholder="Your name"
                className="w-full px-4 py-2 border rounded-xl"
                // onChange={handleChange}
                />
            <input
                type="email"
                name="email"
                placeholder="Your email"
                required
                className="w-full px-4 py-2 border rounded-xl"
                // onChange={handleChange}
            />
            <textarea
                name="pain_point"
                placeholder="What frustrates you most about email?"
                className="w-full px-4 py-2 border rounded-xl"
                // onChange={handleChange}
            />
            <label className="label">
                <input type="checkbox" name='betaTester' className="checkbox checkbox-secondary" />
                I want early access as beta tester
            </label>
            <button
                type="submit"
                className="btn btn-soft btn-secondary w-full"
            >
                Join the Waitlist
            </button>
        </form>
    </div>
  );
};

export default BetaFeedback;