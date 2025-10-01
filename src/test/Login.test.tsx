import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, test, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import Login from "../auth/Login";
import { BrowserRouter } from "react-router-dom";

const mockMutate = vi.fn();
vi.mock("../query/post/userPostLoginMutation.ts", () => {
  return {
    usePostLoginMutation: vi.fn(() => ({
      mutate: mockMutate,
      error: null,
    })),
  };
});

describe("Login Component", () => {
  const queryClient = new QueryClient();

  test("renders all required input fields", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </QueryClientProvider>
    );

    ["identifier", "password"].forEach((field) => {
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

    fireEvent.submit(screen.getByTestId("login-button"));

    expect(screen.getByText(/Username is required/)).toBeInTheDocument();
    expect(screen.getByText(/Password is required/)).toBeInTheDocument();
  });

  test("shows validation errors when submitting empty credential form", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </QueryClientProvider>
    );

    fireEvent.submit(screen.getByTestId("login-button"));

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

    const data = {
      identifier: "christian12345",
      password: "alicaba12345",
    };

    fireEvent.change(screen.getByTestId("identifier"), {
      target: { value: data.identifier },
    });
    fireEvent.change(screen.getByTestId("password"), {
      target: { value: data.password },
    });

    expect((screen.getByTestId("identifier") as HTMLInputElement).value).toBe(
      data.identifier
    );
    expect((screen.getByTestId("password") as HTMLInputElement).value).toBe(
      data.password
    );

    fireEvent.submit(screen.getByTestId("login-button"));
    expect(mockMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        ...data,
      }),
      expect.anything()
    );
  });
});
