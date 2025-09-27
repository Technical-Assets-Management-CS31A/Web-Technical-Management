import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AddItemForm from "../components/AddItem";

const mockMutate = vi.fn();
vi.mock("../query/post/usePostItemMutation", () => ({
  usePostItemMutation: () => ({ mutate: mockMutate }),
}));

describe("Item Component", () => {
  const queryClient = new QueryClient();
  const mockClose = vi.fn();

  test("accepts text input values, file upload and submits", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <AddItemForm onClose={mockClose} />
      </QueryClientProvider>
    );

    const data = {
      ItemName: "Laptop",
      SerialNumber: "SN12345",
      ItemType: "Electronics",
      ItemModel: "XPS 13",
      ItemMake: "Dell",
      Description: "Powerful ultrabook",
      Category: "electronics",
      Condition: "new",
      Image: new File(["dummy"], "test.png", { type: "image/png" }),
    };

    fireEvent.change(screen.getByTestId("ItemName"), {
      target: { value: data.ItemName },
    });
    fireEvent.change(screen.getByTestId("SerialNumber"), {
      target: { value: data.SerialNumber },
    });
    fireEvent.change(screen.getByTestId("ItemType"), {
      target: { value: data.ItemType },
    });
    fireEvent.change(screen.getByTestId("ItemModel"), {
      target: { value: data.ItemModel },
    });
    fireEvent.change(screen.getByTestId("ItemMake"), {
      target: { value: data.ItemMake },
    });
    fireEvent.change(screen.getByTestId("Description"), {
      target: { value: data.Description },
    });
    fireEvent.change(screen.getByTestId("Category"), {
      target: { value: data.Category },
    });
    fireEvent.change(screen.getByTestId("Condition"), {
      target: { value: data.Condition },
    });
    fireEvent.change(screen.getByTestId("Image"), {
      target: { files: [data.Image] },
    });

    expect((screen.getByTestId("ItemName") as HTMLInputElement).value).toBe(
      data.ItemName
    );
    expect((screen.getByTestId("SerialNumber") as HTMLInputElement).value).toBe(
      data.SerialNumber
    );
    expect((screen.getByTestId("ItemType") as HTMLInputElement).value).toBe(
      data.ItemType
    );
    expect((screen.getByTestId("ItemModel") as HTMLInputElement).value).toBe(
      data.ItemModel
    );
    expect((screen.getByTestId("ItemMake") as HTMLInputElement).value).toBe(
      data.ItemMake
    );
    expect((screen.getByTestId("Description") as HTMLInputElement).value).toBe(
      data.Description
    );
    expect((screen.getByTestId("Category") as HTMLSelectElement).value).toBe(
      data.Category
    );
    expect((screen.getByTestId("Condition") as HTMLSelectElement).value).toBe(
      data.Condition
    );

    fireEvent.submit(screen.getByTestId("addItem-button"));
    expect(mockMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        ...data,
        preview: expect.any(String),
      })
    );
  });
});
