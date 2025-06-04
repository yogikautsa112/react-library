import React from "react";
import { createBrowserRouter } from "react-router-dom";
import AuthMiddleware from "../middleware/AuthMiddleware";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import MainLayout from "../layouts/MainLayout";
import BooksIndex from "../pages/books/Index";
import BorrowIndex from "../pages/books/borrowed/Index";
import MemberIndex from "../pages/member/Index";
import FinesIndex from "../pages/books/fines/Index";
import App from "../App";
import ErrorBoundary from "../components/ErrorBoundary";

export const router = createBrowserRouter([
    // Public Routes
    {
        path: "/",
        element: (
            <ErrorBoundary>
                <App />
            </ErrorBoundary>
        )
    },
    {
        path: "/login",
        element: (
            <ErrorBoundary>
                <Login />
            </ErrorBoundary>
        )
    },
    {
        path: "/register",
        element: (
            <ErrorBoundary>
                <Register />
            </ErrorBoundary>
        )
    },
    // Protected Routes with MainLayout
    {
        element: (
            <ErrorBoundary>
                <AuthMiddleware>
                    <MainLayout />
                </AuthMiddleware>
            </ErrorBoundary>
        ),
        children: [
            {
                path: "/dashboard",
                element: <Dashboard />
            },
            {
                path: "/books",
                element: <BooksIndex />
            },
            {
                path: "/members",
                element: <MemberIndex />
            },
            {
                path: "/borrowing",
                element: <BorrowIndex />
            },
            {
                path: "/fines",
                element: <FinesIndex />
            }
        ]
    }
]);
