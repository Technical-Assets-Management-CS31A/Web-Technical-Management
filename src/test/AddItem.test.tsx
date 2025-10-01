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
      </QueryClientProvider>,
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

    fireEvent.change(screen.getByTestId("itemName"), {
      target: { value: data.ItemName },
    });
    fireEvent.change(screen.getByTestId("serialNumber"), {
      target: { value: data.SerialNumber },
    });
    fireEvent.change(screen.getByTestId("itemType"), {
      target: { value: data.ItemType },
    });
    fireEvent.change(screen.getByTestId("itemModel"), {
      target: { value: data.ItemModel },
    });
    fireEvent.change(screen.getByTestId("itemMake"), {
      target: { value: data.ItemMake },
    });
    fireEvent.change(screen.getByTestId("description"), {
      target: { value: data.Description },
    });
    fireEvent.change(screen.getByTestId("category"), {
      target: { value: data.Category },
    });
    fireEvent.change(screen.getByTestId("condition"), {
      target: { value: data.Condition },
    });
    fireEvent.change(screen.getByTestId("image"), {
      target: { files: [data.Image] },
    });

    expect((screen.getByTestId("itemName") as HTMLInputElement).value).toBe(
      data.ItemName,
    );
    expect((screen.getByTestId("serialNumber") as HTMLInputElement).value).toBe(
      data.SerialNumber,
    );
    expect((screen.getByTestId("itemType") as HTMLInputElement).value).toBe(
      data.ItemType,
    );
    expect((screen.getByTestId("itemModel") as HTMLInputElement).value).toBe(
      data.ItemModel,
    );
    expect((screen.getByTestId("itemMake") as HTMLInputElement).value).toBe(
      data.ItemMake,
    );
    expect((screen.getByTestId("description") as HTMLInputElement).value).toBe(
      data.Description,
    );
    expect((screen.getByTestId("category") as HTMLSelectElement).value).toBe(
      data.Category,
    );
    expect((screen.getByTestId("condition") as HTMLSelectElement).value).toBe(
      data.Condition,
    );

    fireEvent.submit(screen.getByTestId("addItem-button"));
    expect(mockMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        ...data,
        preview: expect.any(String),
      }),
    );
  });
});
