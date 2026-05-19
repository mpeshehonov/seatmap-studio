"use client";

import { ToastContainer } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";

export function ToastProvider() {
  return (
    <ToastContainer
      autoClose={3000}
      hideProgressBar
      newestOnTop
      position="bottom-right"
      theme="colored"
    />
  );
}
