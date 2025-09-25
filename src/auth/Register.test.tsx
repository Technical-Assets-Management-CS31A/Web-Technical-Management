import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import Register from "./Register";
import { BrowserRouter } from "react-router-dom";

describe("Register Form", () => {
  test("renders all required input fields", () => {
    render(
      <BrowserRouter>
        <Register onClose={()=> false}/>
      </BrowserRouter>
    );

    expect(screen.getByPlaceholderText(/First name/i));
    expect(screen.getByPlaceholderText(/Last name/i));
    expect(screen.getByPlaceholderText(/Username/i));
    expect(screen.getByPlaceholderText(/^Password$/i));
    expect(screen.getByPlaceholderText(/Confirm password/i));
  });
});