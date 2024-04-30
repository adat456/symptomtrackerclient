import { useState } from "react";
import { useFormState, UseFormRegister, UseFormUnregister, Control, UseFormTrigger, UseFormClearErrors, UseFormGetValues } from "react-hook-form";
import _ from "lodash";
import FeatureType from "../../FeatureType";
import { isInputMoreThanWhitespace } from "../../helpers";
import { FeatureTypeInterface, SymptomFormData } from "../../interfaces";

interface SymptomFormFeatureProps {
    index: number,
    featureType: FeatureTypeInterface,
    register: UseFormRegister<SymptomFormData>,
    unregister: UseFormUnregister<SymptomFormData>,
    control: Control<SymptomFormData, any>,
    trigger: UseFormTrigger<SymptomFormData>,
    clearErrors: UseFormClearErrors<SymptomFormData>,
    getValues: UseFormGetValues<SymptomFormData>
}

interface Options {
    [index: number]: string
}

export default function SymptomFormFeature({ index, featureType, register, unregister, control, trigger, clearErrors, getValues } : SymptomFormFeatureProps) {
    const [ options, setOptions ] = useState<Options>({
        0: "",
        1: ""
    });
    const [ optionKey, setOptionKey ] = useState(2);

    const { errors } = useFormState({ control });

    function renderOptions() {
        return Object.entries(options).map(([key, option]) => 
            <div key={key}>
                {errors[`option-${index}-${key}`] && <p>{errors?.[`option-${index}-${key}`]?.message as string}</p>}
                <label htmlFor={`option-${index}-${key}`}>{`Option ${Number(key) + 1}`}</label>
                <input 
                    type="text" data-key={key} defaultValue={option} id={`option-${index}-${key}`}
                    {...register(`option-${index}-${key}`, {
                        required: "Option is required.",
                        maxLength: {
                            value: 100,
                            message: "Max length is 100 characters."
                        },
                        validate: isInputMoreThanWhitespace
                    })}
                    aria-invalid={errors[`option-${index}-${key}`] ? "true": "false"}
                />
                <button type="button" onClick={() => handleRemoveOptionClick(Number(key))}>X</button>
            </div>
        );
    }
    
    function handleAddOptionClick() {
        setOptions({
            ...options,
            [optionKey]: "",
        });
        setOptionKey(optionKey + 1);
    }

    // TODO: add this as a flash message?
    function handleRemoveOptionClick(key: number) {
        if (Object.keys(options).length > 2) {
            const { [key]: remove, ...remainingOptions } = options;
            setOptions(remainingOptions);
            unregister(`option-${index}-${key}`);
        } else {
            console.log("There must be at least two options available.");
        }
    }

    function isMaxGreaterThanMin(max: number): boolean | string {
        return max > Number(getValues()[`min-${index}`]) || "Maximum value must be greater than the minimum value.";
    }
    function triggerMaxValidationFromMin(): boolean {
        trigger(`max-${index}`);
        return true;
    }

    function isAtLeastOneCheckboxChecked(): boolean {
        const featureCheckboxes: NodeListOf<HTMLInputElement> = document.querySelectorAll(`input[type="checkbox"][id="days-${index}"], input[type="checkbox"][id="hours-${index}"], input[type="checkbox"][id="minutes-${index}"]`);
        let numChecked = 0;

        featureCheckboxes.forEach(checkbox => {
            if (checkbox.checked) numChecked++;
        });

        if (numChecked === 0) {
            return false;
        } else {
            featureCheckboxes.forEach(checkbox => clearErrors(checkbox.id));
            return true;
        }
    }

    return (
        <div id={`feature-${index}`}>
            <div>
                <label>Name</label>
                {errors[`feature-name-${index}`] && <p>{errors?.[`feature-name-${index}`]?.message as string}</p>}
                <input 
                    type="text" 
                    {...register(`feature-name-${index}`, {
                        required: "Feature name is required.",
                        maxLength: {
                            value: 50,
                            message: "Max length is 50 characters."
                        },
                        validate: isInputMoreThanWhitespace
                    })}
                    aria-invalid={errors[`feature-name-${index}`] ? "true": "false"}
                />
            </div>
            {_.isEqual(featureType, FeatureType.Checkbox) || _.isEqual(featureType, FeatureType.Radiobutton) ?
                <div>
                    {renderOptions()}
                    <button type="button" onClick={handleAddOptionClick}>Add option</button>
                </div> : null
            }
            {_.isEqual(featureType, FeatureType.Scale) ? 
                <div>
                    <div>
                        <label htmlFor={`min-${index}`}>Min</label>
                        {errors[`min-${index}`] && <p>{errors?.[`min-${index}`]?.message as string}</p>}
                        <input 
                            type="number" id={`min-${index}`} defaultValue={1}
                            {...register(`min-${index}`, { 
                                required: "Minimum value is required.", 
                                min: {
                                    value: 0,
                                    message: "Minimum value must be between 0 and 19."
                                },
                                validate: triggerMaxValidationFromMin
                            })}
                            aria-invalid={errors[`min-${index}`] ? "true": "false"}
                        />
                    </div>
                    <div>
                        <label htmlFor={`max-${index}`}>Max</label>
                        {errors[`max-${index}`] && <p>{errors?.[`max-${index}`]?.message as string}</p>}
                        <input 
                            type="number" id={`max-${index}`} defaultValue={5}
                            {...register(`max-${index}`, { 
                                required: "Maximum value is required.", 
                                max: {
                                    value: 20,
                                    message: "Maximum value must be between 1 and 20."
                                },
                                validate: isMaxGreaterThanMin
                            })}
                            aria-invalid={errors[`max-${index}`] ? "true": "false"}
                        />
                    </div>
                </div> : null
            }
            {_.isEqual(featureType, FeatureType.Time) ?
                <div>
                    {(errors[`days-${index}`] || errors[`hours-${index}`] || errors[`minutes-${index}`]) && <p>At least one time measurement is required.</p>}
                    <div>
                        <input 
                            type="checkbox" id={`days-${index}`} defaultChecked
                            {...register(`days-${index}`, {
                                validate: isAtLeastOneCheckboxChecked
                            })}
                        />
                        <label htmlFor={`days-${index}`}>days</label>
                    </div>
                    <div>
                        <input 
                            type="checkbox" id={`hours-${index}`} defaultChecked
                            {...register(`hours-${index}`, {
                                validate: isAtLeastOneCheckboxChecked
                            })}
                        />
                        <label htmlFor={`hours-${index}`}>hours</label>
                    </div>
                    <div>
                        <input 
                            type="checkbox" id={`minutes-${index}`} defaultChecked
                            {...register(`minutes-${index}`, {
                                validate: isAtLeastOneCheckboxChecked
                            })}
                        />
                        <label htmlFor={`minutes-${index}`}>minutes</label>
                    </div>
                </div> : null
            }
            {_.isEqual(featureType, FeatureType.Boolean) ? <p>Boolean</p> : null}
            {_.isEqual(featureType, FeatureType.Freetext) ? <p>Free text</p> : null}
        </div>
    )
};