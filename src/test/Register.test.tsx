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

    [
      "firstName",
      "lastName",
      "username",
      "password",
      "confirmPassword",
    ].forEach((field) => {
      expect(screen.getByTestId(field)).toBeInTheDocument();
    });
  });

  test("shows validation errors when submitting empty credential form", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Register onClose={mockClose} />
      </QueryClientProvider>
    );

    fireEvent.submit(screen.getByTestId("register-button"));

    expect(screen.getByText(/Firstname is required/i)).toBeInTheDocument();
    expect(screen.getByText(/Lastname is required/i)).toBeInTheDocument();
    expect(screen.getByText(/Username is required/i)).toBeInTheDocument();
    expect(screen.getByText(/Password is required/)).toBeInTheDocument();
    expect(
      screen.getByText(/Confirm password is required/i)
    ).toBeInTheDocument();
  });

  test("accepts text input values", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Register onClose={mockClose} />
      </QueryClientProvider>
    );

    const data = {
      firstName: "christian",
      lastName: "alicaba",
      username: "christian12345",
      password: "alicaba12345",
      confirmPassword: "alicaba12345",
    };

    fireEvent.change(screen.getByTestId("firstName"), {
      target: { value: data.firstName },
    });
    fireEvent.change(screen.getByTestId("lastName"), {
      target: { value: data.lastName },
    });
    fireEvent.change(screen.getByTestId("username"), {
      target: { value: data.username },
    });
    fireEvent.change(screen.getByTestId("password"), {
      target: { value: data.password },
    });
    fireEvent.change(screen.getByTestId("confirmPassword"), {
      target: { value: data.confirmPassword },
    });

    expect((screen.getByTestId("firstName") as HTMLInputElement).value).toBe(
      data.firstName
    );
    expect((screen.getByTestId("lastName") as HTMLInputElement).value).toBe(
      data.lastName
    );
    expect((screen.getByTestId("username") as HTMLInputElement).value).toBe(
      data.username
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
      })
    );
  });
});
