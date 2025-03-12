import Index from "./Index/Index";
import IndexLayout from "../Layouts/IndexLayout";
import { createBrowserRouter } from "react-router-dom";

export const router = createBrowserRouter([
    {
        path: '/',
        element: <IndexLayout />,
        children: [
            { path: '/', element: <Index />},
        ]
    },
])