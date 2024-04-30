import React, { useState } from "react";
import { useForm } from "react-hook-form";
import SymptomFormFeature from "./SymptomFormFeature";
import FeatureType from "../../FeatureType";
import useAccessToken from "../../hooks/useAccessToken";
import { isInputMoreThanWhitespace } from "../../helpers";
import SymptomFormCategory from "./SymptomFormCategory";
import { Account, Mode, SymptomFormData, FeatureTypeInterface } from "../../interfaces";

interface SymptomFormProps {
    account: Account | null,
    mode: Mode
}

interface Features {
    [index: number]: React.ReactElement
}

export default function SymptomForm({  account, mode } : SymptomFormProps) {
    const [ formSubmitted, setFormSubmitted ] = useState(false);

    const [ featuresIndex, setFeaturesIndex ] = useState(0);
    const [ features, setFeatures ] = useState<Features>({});

    const { register, unregister, handleSubmit, formState: { errors }, clearErrors, control, trigger, getValues, watch, reset } = useForm<SymptomFormData>({
        mode: "onChange",
        defaultValues: {
            "categoryId": "None"
        }
    });

    const accessToken = useAccessToken();

    function renderAddFeatureButtons() {
        return Object.values(FeatureType).map(featureType => 
            <button type="button" key={featureType.name} onClick={() => handleAddFeatureClick(featureType)}>+ {featureType.pretty}</button>
        );
    }

    function renderFeatures() {
        return Object.entries(features).map(([ key, feature ]) => 
            <div key={key}>
                {feature}
                <button type="button" onClick={() => handleRemoveFeatureClick(Number(key))}>Remove feature</button>
            </div>
        )
    }

    function handleAddFeatureClick(featureType: FeatureTypeInterface) {
        setFeatures({
            ...features,
            [featuresIndex]: <SymptomFormFeature 
                index={featuresIndex} featureType={featureType} 
                register={register} unregister={unregister} control={control} trigger={trigger} clearErrors={clearErrors} getValues={getValues}
            />
        });
        setFeaturesIndex(featuresIndex + 1);
    }

    function unregisterAllFeatureInputs(key: number) {
        // given feature key, removes all feature's input fields from RHF data
        const allInputs: NodeListOf<HTMLInputElement> = document.querySelectorAll(`#feature-${key} input`);
        allInputs.forEach(input => unregister(input.id));
    }

    function handleRemoveFeatureClick(key: number) {
        const { [key]: remove, ...remainingFeatures } = features;
        setFeatures(remainingFeatures);
        unregisterAllFeatureInputs(key);
    }

    async function createSymptom(name: string, description = "", categoryId: number | null = null) {
        const reqOptions = {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({ name, description, accountId: account?.accountId, categoryId })
        };

        try {
            const req = await fetch("http://localhost:8080/symptom", reqOptions);
            if (req.ok) {
                const res = await req.json();
                return res;
                // TODO: store res when building out symptom overview
            } else {
                const res = await req.text();
                throw new Error(res);
            }
        // TODO: create error object TS interface
        } catch(e: any) {
            // TODO: propagate detailed error
            console.error(e);
            throw new Error(e);
        }
    };

    async function createFeature(name: string, type: string, allowableValues: string[] = [], symptomId: number) {
        const reqOptions = {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({ name, type, allowableValues, symptomId })
        };

        try {
            const req = await fetch("http://localhost:8080/feature", reqOptions);
            if (req.ok) {
                const res = await req.json();
                return res;
                // TODO: store res when building out symptom overview
            } else {
                const res = await req.text();
                throw new Error(res);
            }
        // TODO: create error object TS interface
        } catch(e: any) {
            // TODO: propagate detailed error
            console.error(e);
            throw new Error(e);
        }
    };

    async function onSubmit(data: SymptomFormData) {
        try {
            let { name, description, categoryId } = data;
            const { symptomId } = await createSymptom(name, description, typeof categoryId === "string" ? null : categoryId);

            const featureNames = Object.entries(data).filter(([ feature ]) => feature.indexOf("feature-name-") === 0);
            const featureData = featureNames.map(([ feature, name ]) => {
                const featureIndex: number = Number(feature.slice(-1));
                const type = features[featureIndex].props.featureType.name;
    
                let allowableValues: string[] = [];
                switch (type) {
                    case FeatureType.Scale.name:
                        const { [`min-${featureIndex}`]: min, [`max-${featureIndex}`]: max } = data;
                        allowableValues.push(String(min), String(max));
                        break;
                    case FeatureType.Checkbox.name:
                    case FeatureType.Radiobutton.name:
                        allowableValues = Object.entries(data)
                            .filter(([ feature ]) => feature.indexOf(`option-${featureIndex}-`) === 0)
                            .map(object => Object.values(object)[1] as string);
                        break;
                    case FeatureType.Time.name:
                        if (data[`days-${featureIndex}`]) allowableValues.push("days");
                        if (data[`hours-${featureIndex}`]) allowableValues.push("hours");
                        if (data[`minutes-${featureIndex}`]) allowableValues.push("minutes");
                        break;
                    default:
                        break;
                }
                return { name, type, allowableValues, symptomId };
            });
    
            await Promise.all(featureData.map(async ({ name, type, allowableValues, symptomId }) => await createFeature(name, type, allowableValues, symptomId)));
        } catch(e) {
            // TODO: display error message to user
            console.error(e);
            return;
        }

        reset();
        setFormSubmitted(true);
    }

    function handleCloseFormClick() {
        reset();
        setFeaturesIndex(0);
        setFeatures({});
        
        const symptomForm: HTMLDialogElement | null = document.querySelector("dialog");
        symptomForm?.close();
    }

    return (
        <dialog>
            {formSubmitted ?
                <div>
                    <p>Symptom successfully created!</p>
                    <button type="button" onClick={() => setFormSubmitted(false)}>Add another symptom</button>
                </div> :
                <form onSubmit={handleSubmit(onSubmit)}>
                    <button type="button" onClick={handleCloseFormClick}>Close</button>
                    <h2>{mode} Symptom</h2>
                    <div>
                        <label htmlFor="name">Name</label>
                        {errors.name && <p>{errors.name.message}</p>}
                        <input 
                            type="text" id="name" maxLength={50}
                            {...register("name", { 
                                required: "Name is required.", 
                                maxLength: {
                                    value: 50,
                                    message: "Max length is 50 characters."
                                },
                                validate: isInputMoreThanWhitespace
                            })}
                            aria-invalid={errors.name ? "true": "false"}
                        />
                    </div>
                    <div>
                        <label htmlFor="description">Description</label>
                        {errors.description && <p>{errors.description.message}</p>}
                        <textarea 
                            id="description" maxLength={200}
                            {...register("description", { maxLength: {
                                value: 200,
                                message: "Max length is 200 characters."
                            }})} 
                            aria-invalid={errors.description ? "true": "false"}
                        />
                    </div>
                    <SymptomFormCategory account={account} registerOnParent={register} watchOnParent={watch} />
                    <section>
                        <h3>Add a feature</h3>
                        {renderAddFeatureButtons()}
                    </section>
                    <section>
                        <h3>Features</h3>
                        {renderFeatures()}
                    </section>
                    <button type="submit">Create</button>
                </form>
            }
        </dialog>
    )
};