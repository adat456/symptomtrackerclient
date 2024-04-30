import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import server from "../../mswserver";
import SymptomForm from "./SymptomForm";
import { Account, Mode } from "../../interfaces";

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

beforeAll(() => server.listen());
afterAll(() => server.close());

/// name input validation ///

test("whitespace-only name input is invalid (before submitting)", async () => {
    const user = userEvent.setup();
    render(<SymptomForm {...props} />)

    await user.type(screen.getByRole("textbox", { name: /name/i, hidden: true }), "  ");

    expect(screen.getByRole("textbox", { name: /name/i, hidden: true} )).toBeInvalid();
})

test("empty name input is invalid (after submitting)", async () => {
    const user = userEvent.setup();
    render(<SymptomForm {...props} />)

    await user.click(screen.getByRole("button", { name: "Create", hidden: true }));

    expect(screen.getByText("Name is required.")).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /name/i, hidden: true })).toBeInvalid();
})

test("valid name input is valid (after correcting initial invalid input)", async () => {
    const user = userEvent.setup();
    render(<SymptomForm {...props} />)

    await user.click(screen.getByText("Create"));
    await user.type(screen.getByRole("textbox", { name: /name/i, hidden: true }), "A valid name");

    expect(screen.queryByText("Name is required.")).toBeNull();
    expect(screen.queryByText("This field is required.")).toBeNull();
    expect(screen.getByRole("textbox", { name: /name/i, hidden: true })).toBeValid();
})

/// adding and removing features ///

test("all add feature buttons are present", () => {
    render(<SymptomForm {...props} />)

    expect(screen.getByRole("button", { name: /scale/i, hidden: true })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /radio/i, hidden: true })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /checkbox/i, hidden: true })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /boolean/i, hidden: true })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /text/i, hidden: true })).toBeInTheDocument();
})

test("clicking add scale feature button adds scale feature inputs", async () => {
    const user = userEvent.setup();
    render(<SymptomForm {...props} />)

    await user.click(screen.getByRole("button", { name: /scale/i, hidden: true }));

    expect(screen.getByLabelText(/min/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/max/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Remove feature", hidden: true })).toBeInTheDocument();
})

test("clicking add checkbox feature button adds checkbox feature inputs", async () => {
    const user = userEvent.setup();
    render(<SymptomForm {...props} />)

    await user.click(screen.getByRole("button", { name: /checkbox/i, hidden: true }));

    expect(screen.getAllByRole("textbox", { name: /option/i, hidden: true })).toHaveLength(2);
    expect(screen.getByRole("button", { name: "Remove feature", hidden: true })).toBeInTheDocument();
})

test("clicking add time feature button adds time feature inputs", async () => {
    const user = userEvent.setup();
    render(<SymptomForm {...props} />)

    await user.click(screen.getByRole("button", { name: /time/i, hidden: true }));

    expect(screen.getAllByRole("checkbox", { hidden: true })).toHaveLength(3);
    expect(screen.getByRole("button", { name: "Remove feature", hidden: true })).toBeInTheDocument();
});

test("clicking remove (time) feature button removes (time) feature inputs", async () => {
    const user = userEvent.setup();
    render(<SymptomForm {...props} />)

    await user.click(screen.getByRole("button", { name: /time/i, hidden: true }));
    await user.click(screen.getByRole("button", { name: /remove/i, hidden: true }));

    expect(screen.queryAllByRole("checkbox", { hidden: true })).toHaveLength(0);
    expect(screen.queryByRole("button", { name: "Remove feature", hidden: true })).toBeNull();
})

/// submitting form data ///

test("submitting valid symptom inputs shows a success message", async () => {
    const user = userEvent.setup();
    render(<SymptomForm {...props} />);


    await user.type(screen.getByRole("textbox", { name: /name/i, hidden: true }), "Symptom name");
    await user.type(screen.getByRole("textbox", { name: /description/i, hidden: true }), "Symptom description")
    await user.click(screen.getByRole("button", { name: /create/i, hidden: true }));

    expect(screen.getByText(/success/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add another/i, hidden: true })).toBeInTheDocument();
});
