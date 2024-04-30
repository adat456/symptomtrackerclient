import { useState } from "react";
import SymptomForm from "./SymptomForm";
import { Account, Mode } from "../../interfaces";

interface SymptomOverviewProps {
    account: Account | null;
}

export default function SymptomOverview({ account } : SymptomOverviewProps) {
    const [ symptomFormMode, setSymptomFormMode ] = useState<Mode>("Add");

    function handleAddSymptomClick() {
        setSymptomFormMode("Add");
        const symptomForm: HTMLDialogElement | null = document.querySelector("dialog");
        symptomForm?.showModal();
    };

    return (
        // replace with <main> after introducing routing
        <div>
            <button type="button" onClick={handleAddSymptomClick}>Add Symptom</button>
            <SymptomForm account={account} mode={symptomFormMode} />
        </div>
    );
};