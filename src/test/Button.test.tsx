import "@testing-library/jest-dom"
import { describe, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Button from "../components/Button";
import CloseButton from "../components/CloseButton";

const mockClose = vi.fn()

describe("Button Component", () => {
  test("renders button with name", () => {
    render(<Button name="Add Item" />);
    expect(
      screen.getByTestId("button")
    ).toBeInTheDocument();
  });
});

describe("Close Button Component", () => {
  test("renders close button", () => {
    render(<CloseButton onClick={mockClose} />);
    expect(screen.getByTestId("closebutton")).toBeInTheDocument();
  });
});
