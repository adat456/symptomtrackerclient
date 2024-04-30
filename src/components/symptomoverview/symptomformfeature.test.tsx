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
        categories: [],
        symptoms: []
    },
    mode: "Add"
}

/// checkbox/radio button input validation ///

test("clicking add option button adds option input", async () => {
    const user = userEvent.setup();
    render(<SymptomForm {...props} />);

    await user.click(screen.getByRole("button", { name: /checkbox/i, hidden: true }));
    await user.click(screen.getByRole("button", { name: /add option/i, hidden: true }));

    expect(screen.getAllByRole("textbox", { name: /option/i, hidden: true })).toHaveLength(3);
})

test("clicking remove option button removes option input", async () => {
    const user = userEvent.setup();
    render(<SymptomForm {...props} />);

    await user.click(screen.getByRole("button", { name: /checkbox/i, hidden: true }));
    await user.click(screen.getByRole("button", { name: /add option/i, hidden: true }));
    await user.click(screen.getAllByRole("button", { name: 'X', hidden: true })[0])

    expect(screen.getAllByRole("textbox", { name: /option/i, hidden: true })).toHaveLength(2);
})

test("clicking remove option button when there are only 2 options does not remove an option input", async () => {
    const user = userEvent.setup();
    render(<SymptomForm {...props} />);

    await user.click(screen.getByRole("button", { name: /checkbox/i, hidden: true }));
    await user.click(screen.getAllByRole("button", { name: 'X', hidden: true })[0]);

    expect(screen.getAllByRole("textbox", { name: /option/i, hidden: true })).toHaveLength(2);
})

test("empty option inputs are invalid", async () => {
    const user = userEvent.setup();
    render(<SymptomForm {...props} />);

    await user.click(screen.getByRole("button", { name: /checkbox/i, hidden: true }));
    await user.click(screen.getByRole("button", { name: "Create", hidden: true }));

    expect(screen.queryAllByText(/option is required/i)).toHaveLength(2);
    expect(screen.getAllByRole("textbox", { name: /option/i, hidden: true })[0]).toBeInvalid();
    expect(screen.getAllByRole("textbox", { name: /option/i, hidden: true })[1]).toBeInvalid();
})

/// time input validation ///

test("one checked time checkbox is valid", async () => {
    const user = userEvent.setup();
    render(<SymptomForm {...props} />);

    await user.click(screen.getByRole("button", { name: /time/i, hidden: true }));

    await user.click(screen.getByRole("checkbox", { name: /day/i, hidden: true })); 

    expect(screen.queryByText(/at least one time measurement is required/i)).toBeNull();
})

test("no checked time checkboxes is invalid", async () => {
    const user = userEvent.setup();
    render(<SymptomForm {...props} />);

    await user.click(screen.getByRole("button", { name: /time/i, hidden: true }));

    await user.click(screen.getByRole("checkbox", { name: /day/i, hidden: true }));
    await user.click(screen.getByRole("checkbox", { name: /hour/i, hidden: true }));
    await user.click(screen.getByRole("checkbox", { name: /minute/i, hidden: true })); 

    expect(screen.getByText(/at least one time measurement is required/i)).toBeInTheDocument();
})

/// scale input validation ///

test("default max and min are valid", async () => {
    const user = userEvent.setup();
    render(<SymptomForm {...props} />);

    await user.click(screen.getByRole("button", { name: /scale/i, hidden: true }));

    expect(screen.getByRole("spinbutton", { name: /min/i, hidden: true })).toBeValid();
    expect(screen.getByRole("spinbutton", { name: /max/i, hidden: true })).toBeValid();
})

test("max greater than min so max input is valid", async () => {
    const user = userEvent.setup();
    render(<SymptomForm {...props} />);

    await user.click(screen.getByRole("button", { name: /scale/i, hidden: true }));

    await user.clear(screen.getByRole("spinbutton", { name: /min/i, hidden: true }));
    await user.clear(screen.getByRole("spinbutton", { name: /max/i, hidden: true }));

    await user.type(screen.getByRole("spinbutton", { name: /min/i, hidden: true }), "5");
    await user.type(screen.getByRole("spinbutton", { name: /max/i, hidden: true }), "7");
    screen.debug();

    expect(screen.getByRole("spinbutton", { name: /max/i, hidden: true })).toBeValid();
})

test("max equal to min and max input is invalid", async () => {
    const user = userEvent.setup();
    render(<SymptomForm {...props} />);

    await user.click(screen.getByRole("button", { name: /scale/i, hidden: true }));

    await user.clear(screen.getByRole("spinbutton", { name: /min/i, hidden: true }));
    await user.clear(screen.getByRole("spinbutton", { name: /max/i, hidden: true }));

    await user.type(screen.getByRole("spinbutton", { name: /min/i, hidden: true }), "5");
    await user.type(screen.getByRole("spinbutton", { name: /max/i, hidden: true }), "3");

    expect(screen.getByText(/must be greater than/i)).toBeInTheDocument();
    expect(screen.getByRole("spinbutton", { name: /max/i, hidden: true })).toBeInvalid();
})

test("max less than min and max input is invalid", async () => {
    const user = userEvent.setup();
    render(<SymptomForm {...props} />);

    await user.click(screen.getByRole("button", { name: /scale/i, hidden: true }));

    await user.clear(screen.getByRole("spinbutton", { name: /min/i, hidden: true }));
    await user.clear(screen.getByRole("spinbutton", { name: /max/i, hidden: true }));

    await user.type(screen.getByRole("spinbutton", { name: /min/i, hidden: true }), "3");
    await user.type(screen.getByRole("spinbutton", { name: /max/i, hidden: true }), "5");
    await user.type(screen.getByRole("spinbutton", { name: /min/i, hidden: true }), "4");

    expect(screen.getByText(/must be greater than/i)).toBeInTheDocument();
    expect(screen.getByRole("spinbutton", { name: /max/i, hidden: true })).toBeInvalid();
})
