import React from 'react'

export default function AlertMessage({ type, message }) {
    if (!message) return null
    
    const isSuccess = type === 'success'
    
    return (
        <div className={`mx-6 mt-4 p-3 ${isSuccess ? 'bg-green-100 border-green-400 text-green-700' : 'bg-red-100 border-red-400 text-red-700'} rounded-lg ${isSuccess ? 'animate-fade-in-down' : ''}`} role="alert">
            <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {isSuccess ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    )}
                </svg>
                <p>{message}</p>
            </div>
        </div>
    )
}