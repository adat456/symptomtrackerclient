import { useEffect, useState } from "react";
import { useForm, UseFormRegister, UseFormWatch } from "react-hook-form";
import useAccessToken from "../../hooks/useAccessToken";
import { Account, SymptomFormData } from "../../interfaces";
import { isInputMoreThanWhitespace } from "../../helpers";

interface SymptomFormCategoryProps {
    account: Account | null,
    registerOnParent: UseFormRegister<SymptomFormData>,
    watchOnParent: UseFormWatch<SymptomFormData>
}

interface CategoryFormData {
    name: string,
    description: string
}

export default function SymptomFormCategory({ account, registerOnParent, watchOnParent }: SymptomFormCategoryProps) {
    // TODO: remove after implementing state updates (following successful POST requests)
    const [ categories, setCategories ] = useState(account?.categories);
    const [ addSymptomVis, setAddSymptomVis ] = useState(false);

    const { handleSubmit, register, formState: { errors }, reset } = useForm<CategoryFormData>();

    const accessToken = useAccessToken();

    function renderCategoryOptions() {
        return categories?.map(category => 
            <option key={category.categoryId} value={category.categoryId}>{category.name} </option>
        );
    }

    const categoryId = watchOnParent("categoryId");
    useEffect(() => {
        setAddSymptomVis(categoryId === "Add");
    }, [categoryId]);

    function isCategoryNameUnique(newCategory: string) {
        const cleanedNewCategoryName = newCategory.trim().toLowerCase();
        const cleanedCategoryNames = categories?.map(category => category.name.trim().toLowerCase());
        return !cleanedCategoryNames?.some(category => category === cleanedNewCategoryName) || "New category must be unique.";
    }

    async function createNewCategory(name: string, description: string) {
        const reqOptions = {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({ name, description, accountId: account?.accountId })
        };

        try {
            const req = await fetch("http://localhost:8080/category", reqOptions);
            if (req.ok) {
                const res = await req.json();
                return res;
            } else {
                const res = await req.text();
                throw new Error(res);
            }
        } catch(e) {
            // TODO: display error message to user
            console.error(e);
        }
    }

    async function onSubmit(data: CategoryFormData) {
        await createNewCategory(data.name, data.description)
            .then(newCategory => {
                 // TODO: remove after implementing state updates (following successful POST requests)
                categories ? setCategories([...categories, newCategory]) : setCategories([newCategory]);
                // TODO: set current selected option to newly created category
                setAddSymptomVis(false);
                reset();
            })
            // TODO: display error message to user
            .catch(e => console.error(e));
    }
    
    return (
        <div>
            <div>
                <label htmlFor="category">Category (optional)</label>
                <select id="category" value={categoryId} {...registerOnParent("categoryId")}>
                    <option value="None">None</option>
                    {renderCategoryOptions()}
                    <option value="Add">Add</option>
                </select>
            </div>
            {addSymptomVis ?
                <div>
                    <div>
                        <label htmlFor="categoryName">New category</label>
                        {errors.name && <p>{errors.name.message}</p>}
                        <input 
                            type="text" id="categoryName"
                            {...register("name", {
                                required: "New category name is required.",
                                maxLength: {
                                    value: 50,
                                    message: "Max length is 50 characters."
                                },
                                validate: {
                                    isCategoryNameUnique,
                                    isInputMoreThanWhitespace
                                }
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
                    <button type="button" onClick={handleSubmit(onSubmit)}>Add</button>
                </div> : null
            }
        </div>
    );
}