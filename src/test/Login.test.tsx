import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, test, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import Login from "../auth/Login";
import { BrowserRouter } from "react-router-dom";

const queryClient = new QueryClient();

vi.mock("../query/post/usePostItemMutation", () => ({
  usePostItemMutation: () => ({
    mutate: vi.fn(),
  }),
}));

describe("Login Component", () => {
  test("renders all required input fields", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </QueryClientProvider>
    );

    ["username", "password"].forEach((field) => {
      expect(screen.getByTestId(field)).toBeInTheDocument();
    });
  });

  test("shows validation errors when submitting empty credential form", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </QueryClientProvider>
    );

    fireEvent.submit(screen.getByTestId("login-form"));

    expect(screen.getByText(/username is required/i)).toBeInTheDocument();
    expect(screen.getByText(/password is required/i)).toBeInTheDocument();
  });

  test("accepts text input values", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </QueryClientProvider>
    );

    const username = screen.getByTestId("username") as HTMLInputElement;
    const password = screen.getByTestId("password") as HTMLInputElement;

    fireEvent.change(username, { target: { value: "christian12345" } });
    fireEvent.change(password, { target: { value: "alicaba12345" } });

    expect(username.value).toBe("christian12345");
    expect(password.value).toBe("alicaba12345");
  });
});
