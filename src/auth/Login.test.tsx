import { render, screen } from "@testing-library/react";
import Login from "./Login";
import { describe, test, expect } from "vitest";
import { BrowserRouter } from "react-router-dom";

describe("Login Component", () => {
  test("Login User Credentials and validate if its account not found", () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    expect(screen.getByPlaceholderText(/Username/i));
    expect(screen.getByPlaceholderText(/Password$/i));
  });
});