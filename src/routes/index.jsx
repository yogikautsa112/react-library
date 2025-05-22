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

export const router = createBrowserRouter([
    // Public Routes
    {
        path: "/login",
        element: (
            <AuthMiddleware>
                <Login />
            </AuthMiddleware>
        ),
    },
    {
        path: "/register",
        element: (
            <AuthMiddleware>
                <Register />
            </AuthMiddleware>
        ),
    },
    // Protected Routes
    {
        path: "/",
        element: (
            <AuthMiddleware>
                <MainLayout />
            </AuthMiddleware>
        ),
        children: [
            {
                path: "dashboard",
                element: <Dashboard />,
            },
            {
                path: "members",
                element: <MemberIndex />,
            },
            {
                path: "books",
                element: <BooksIndex />,
            },
            {
                path: "borrowing",
                element: <BorrowIndex />,
            },
            {
                path: "fines",
                element: <FinesIndex />,
            },
        ],
    },
]);
