import { render, screen } from "@testing-library/react";
import SymptomOverview from "./SymptomOverview";
import { Account } from "../../interfaces";

const mockAccount: Account = {
    accountId: 1,
    username: "username",
    categories: [],
    symptoms: []
}

test("has button for adding symptoms", () => {
    render(<SymptomOverview account={mockAccount} />);
    expect(screen.getByRole("button"));
})