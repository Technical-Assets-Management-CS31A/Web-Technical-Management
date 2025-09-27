import "@testing-library/jest-dom";
import { describe, expect, test, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import CloseButton from "../components/CloseButton";
import EditStaff from "../components/EditStaff";

describe("EditStaff Component", () => {

  test("renders with all required fields", () => {
    const mockClose = vi.fn();
    render(<EditStaff id={1} onClose={mockClose} />);

    expect(screen.getByText(/edit staff/i)).toBeInTheDocument();

    ["id", "firstName", "lastName", "role", "status"].forEach((field) => {
      expect(screen.getByTestId(field)).toBeInTheDocument();
    });
  });

  test("updates input values", () => {
    const mockClose = vi.fn();
    render(<EditStaff id={1} onClose={mockClose} />);

    const firstNameInput = screen.getByTestId("firstName") as HTMLInputElement;
    const lastNameInput = screen.getByTestId("lastName") as HTMLInputElement;

    fireEvent.change(firstNameInput, { target: { value: "christian" } });
    fireEvent.change(lastNameInput, { target: { value: "alicaba" } });

    expect(firstNameInput.value).toBe("christian");
    expect(lastNameInput.value).toBe("alicaba");
  });

  test("submits form and calls onClose", () => {
    const mockClose = vi.fn();
    render(<EditStaff id={1} onClose={mockClose} />);

    const form =
      screen.getByTestId("form") ||
      screen.getByText(/save changes/i).closest("form");

    fireEvent.submit(form!);
    expect(mockClose).toHaveBeenCalled();
  });

  test("calls onClose when clicking close button", () => {
    const mockClose = vi.fn();
    render(<EditStaff id={1} onClose={mockClose} />);
    render(<CloseButton onClick={mockClose} />);
  });
});
