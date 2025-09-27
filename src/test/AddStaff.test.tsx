import "@testing-library/jest-dom";
import { describe, test, vi, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AddStaff } from "../components/AddStaff";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const mockMutate = vi.fn();

describe("Staff Component", () => {
  vi.mock("../query/post/usePostStaffMutation.ts", () => ({
    usePostStaffMutation: () => ({
      mutate: mockMutate,
    }),
  }));

  const queryClient = new QueryClient();
  const mockClose = vi.fn();

  test("renders all required fields", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <AddStaff onClose={mockClose} />
      </QueryClientProvider>
    );

    const fields = [
      "firstName",
      "lastName",
      "middleName",
      "username",
      "email",
      "phoneNumber",
      "password",
      "confirmPassword",
      "position",
    ];

    fields.forEach((field) => {
      expect(screen.getByTestId(field)).toBeInTheDocument();
    });
  });

  test("shows validation errors when submitting empty form", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <AddStaff onClose={mockClose} />
      </QueryClientProvider>
    );

    fireEvent.submit(screen.getByTestId("button-staff")); // ✅ safer than button

    expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/last name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/username is required/i)).toBeInTheDocument();
    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    expect(screen.getByText(/phone number is required/i)).toBeInTheDocument();
    expect(screen.getByText(/position is required/i)).toBeInTheDocument();
    expect(screen.getByText(/password is required/)).toBeInTheDocument();
    expect(
      screen.getByText(/confirm password is required/i)
    ).toBeInTheDocument();
  });

  test("accepts text input values and submits", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <AddStaff onClose={mockClose} />
      </QueryClientProvider>
    );

    const data = {
      firstName: "christian",
      lastName: "alicaba",
      middleName: "lauron",
      username: "christian12345",
      email: "christian@gmail.com",
      phoneNumber: "09565376522",
      password: "alicaba12345",
      confirmPassword: "alicaba12345",
      position: "Technical",
    };

    fireEvent.change(screen.getByTestId("firstName"), {
      target: { value: data.firstName },
    });
    fireEvent.change(screen.getByTestId("lastName"), {
      target: { value: data.lastName },
    });
    fireEvent.change(screen.getByTestId("middleName"), {
      target: { value: data.middleName },
    });
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
    fireEvent.change(screen.getByTestId("position"), {
      target: { value: data.position },
    });

    expect((screen.getByTestId("firstName") as HTMLInputElement).value).toBe(
      data.firstName
    );
    expect((screen.getByTestId("lastName") as HTMLInputElement).value).toBe(
      data.lastName
    );
    expect((screen.getByTestId("middleName") as HTMLInputElement).value).toBe(
      data.middleName
    );
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
    expect((screen.getByTestId("position") as HTMLSelectElement).value).toBe(
      data.position
    );

    fireEvent.submit(screen.getByTestId("button-staff"));
    // expect(mockMutate).toHaveBeenCalledWith(expect(data));
  });
});
