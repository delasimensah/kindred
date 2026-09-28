import { screen, within } from "@testing-library/react";

import { render } from "@/test-utils";

import Breadcrumb from "./Breadcrumb";

describe("Breadcrumb", () => {
  it("links back to the parent and marks the current page", () => {
    render(
      <Breadcrumb
        items={[
          { label: "Catalog", href: "/admin/catalog" },
          { label: "Amaara Mensah" },
        ]}
      />
    );

    const nav = screen.getByRole("navigation", { name: "Breadcrumb" });
    expect(within(nav).getByRole("link", { name: "Catalog" })).toHaveAttribute(
      "href",
      "/admin/catalog"
    );
    expect(within(nav).getByText("Amaara Mensah")).toHaveAttribute(
      "aria-current",
      "page"
    );
  });
});
