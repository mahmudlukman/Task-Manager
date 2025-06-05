import { useEffect } from "react";
import { RouterProvider, createBrowserRouter, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useSelector } from "react-redux";
import { RootState } from "./@types";
import Dashboard from "./pages/Admin/Dashboard";
import Login from "./pages/Auth/Login";
import SignUp from "./pages/Auth/SignUp";
import ManageTasks from "./pages/Admin/ManageTasks";
import CreateTask from "./pages/Admin/CreateTask";
import ManageUsers from "./pages/Admin/ManageUsers";
import UserDashboard from "./pages/User/UserDashboard";
import UserProfile from "./pages/User/UserProfile";
import MyTasks from "./pages/User/MyTasks";
import ViewTaskDetails from "./pages/User/ViewTaskDetails";
import Notifications from "./pages/User/Notifications";
import PrivateRoute from "./routes/PrivateRoute";
import { socketId } from "./utils/helper";

const Root = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (user.role === "admin") {
    return <Navigate to="/admin/dashboard" />;
  }

  return <Navigate to="/user/dashboard" />;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signUp",
    element: <SignUp />,
  },
  // Admin Routes
  {
    path: "/admin",
    element: <PrivateRoute allowedRoles={["admin"]} />,
    children: [
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "tasks",
        element: <ManageTasks />,
      },
      {
        path: "create-task",
        element: <CreateTask />,
      },
      {
        path: "users",
        element: <ManageUsers />,
      },
      {
        path: "notifications",
        element: <Notifications />,
      },
      {
        path: "profile",
        element: <UserProfile />,
      },
    ],
  },
  // User Routes
  {
    path: "/user",
    element: <PrivateRoute allowedRoles={["member"]} />,
    children: [
      {
        path: "dashboard",
        element: <UserDashboard />,
      },
      {
        path: "tasks",
        element: <MyTasks />,
      },
      {
        path: "profile",
        element: <UserProfile />,
      },
      {
        path: "task-details/:id",
        element: <ViewTaskDetails />,
      },
      {
        path: "notifications",
        element: <Notifications />,
      },
    ],
  },
]);

const App = () => {
  useEffect(() => {
    // Optional: Log connection status for debugging
    socketId.on("connect", () => {
      console.log("Connected to Socket.IO server");
    });
    socketId.on("disconnect", () => {
      console.log("Disconnected from Socket.IO server");
    });

    return () => {
      socketId.off("connect");
      socketId.off("disconnect");
    };
  }, []);

  return (
    <>
      <RouterProvider router={router} />
      <Toaster
        toastOptions={{
          className: "",
          style: {
            fontSize: "13px",
          },
        }}
      />
    </>
  );
};

export default App;