import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Account, Mode } from "../../interfaces";
import SymptomForm from "./SymptomForm";

interface Props {
    account: Account,
    mode: Mode
}

const props: Props = {
    account: {
        accountId: 1,
        username: "username",
        categories: [
            {
                categoryId: 1,
                name: "GI",
                description: "",
                symptoms: []
            },
            {
                categoryId: 2,
                name: "Neuro",
                description: "",
                symptoms: []
            }
        ],
        symptoms: []
    },
    mode: "Add"
}

test("existing categories, none, and add options are rendered", () => {
    render(<SymptomForm {...props} />);

    expect(screen.getAllByRole("option", { hidden: true })).toHaveLength(4);
})

test("clicking add option reveals add category input", async () => {
    const user = userEvent.setup();
    render(<SymptomForm {...props} />);

    await user.selectOptions(
        screen.getByRole("combobox", { name: /category/i, hidden: true }), 
        screen.getByRole("option", { name: /add/i, hidden: true })
    );

    expect(screen.getByRole("textbox", { name: /category/i, hidden: true })).toBeInTheDocument();
})

test("empty category name input is invalid", async () => {
    const user = userEvent.setup();
    render(<SymptomForm {...props} />);

    await user.selectOptions(
        screen.getByRole("combobox", { name: /category/i, hidden: true }), 
        screen.getByRole("option", { name: /add/i, hidden: true })
    );
    await user.click(screen.getAllByRole("button", { name: /add/i, hidden: true })[0]);

    expect(screen.getByText(/required/i)).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /category/i, hidden: true })).toBeInvalid();
})

test("whitespace-only category name input is invalid", async () => {
    const user = userEvent.setup();
    render(<SymptomForm {...props} />);

    await user.selectOptions(
        screen.getByRole("combobox", { name: /category/i, hidden: true }), 
        screen.getByRole("option", { name: /add/i, hidden: true })
    );
    await user.type(screen.getByRole("textbox", { name: /category/i, hidden: true }), "   ");
    await user.click(screen.getAllByRole("button", { name: /add/i, hidden: true })[0]);

    expect(screen.getByText(/required/i)).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /category/i, hidden: true })).toBeInvalid();
})