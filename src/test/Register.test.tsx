import "@testing-library/jest-dom";
import { describe, test, expect, vi } from "vitest";
import { fireEvent, screen, render } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Register from "../auth/Register";

const mockMutate = vi.fn();

vi.mock("../query/post/usePostRegisterMutation.ts", () => {
  return {
    usePostRegisterMutation: vi.fn(() => ({
      mutate: mockMutate,
      error: null,
    })),
  };
});

describe("Register Component", () => {
  const queryClient = new QueryClient();
  const mockClose = vi.fn();

  test("renders all required input fields", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Register onClose={mockClose} />
      </QueryClientProvider>
    );

    ["username", "email", "phoneNumber", "password", "confirmPassword"].forEach(
      (field) => {
        expect(screen.getByTestId(field)).toBeInTheDocument();
      }
    );
  });

  test("shows validation errors when submitting empty credential form", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Register onClose={mockClose} />
      </QueryClientProvider>
    );

    fireEvent.submit(screen.getByTestId("register-button"));

    expect(screen.getByText(/Username is required/i)).toBeInTheDocument();
    expect(screen.getByText(/Email is required/i)).toBeInTheDocument();
    expect(screen.getByText(/Phone number is required/i)).toBeInTheDocument();
    expect(screen.getByText(/Password is required/)).toBeInTheDocument();
    expect(
      screen.getByText(/Confirm password is required/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Confirm password is required/i)
    ).toBeInTheDocument();
  });

  test("accepts text input values and submit", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Register onClose={mockClose} />
      </QueryClientProvider>
    );

    const data = {
      username: "christian",
      email: "alicaba",
      phoneNumber: "09565376522",
      role: "Admin",
      password: "alicaba12345",
      confirmPassword: "alicaba12345",
    };

    fireEvent.change(screen.getByTestId("username"), {
      target: { value: data.username },
    });
    fireEvent.change(screen.getByTestId("email"), {
      target: { value: data.email },
    });
    fireEvent.change(screen.getByTestId("phoneNumber"), {
      target: { value: data.phoneNumber },
    });
    fireEvent.change(screen.getByTestId("password"), {
      target: { value: data.password },
    });
    fireEvent.change(screen.getByTestId("confirmPassword"), {
      target: { value: data.confirmPassword },
    });

    expect((screen.getByTestId("username") as HTMLInputElement).value).toBe(
      data.username
    );
    expect((screen.getByTestId("email") as HTMLInputElement).value).toBe(
      data.email
    );
    expect((screen.getByTestId("phoneNumber") as HTMLInputElement).value).toBe(
      data.phoneNumber
    );
    expect((screen.getByTestId("password") as HTMLInputElement).value).toBe(
      data.password
    );
    expect(
      (screen.getByTestId("confirmPassword") as HTMLInputElement).value
    ).toBe(data.confirmPassword);

    fireEvent.submit(screen.getByTestId("register-button"));

    expect(mockMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        ...data,
        role: data.role,
      }),
      expect.anything()
    );
  });
  
});
