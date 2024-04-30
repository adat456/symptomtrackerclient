///// API-specific interfaces /////

export interface User {
    email: string,
    email_verified: boolean,
    name: string,
    nickname: string,
    picture: string,
    sub: string,
    updated_at: string
}

export interface Account {
    accountId: number,
    username: string,
    categories: CategorySlim[],
    symptoms: SymptomSlim[],
}

export interface CategorySlim {
    categoryId: number,
    name: string,
    description: string,
    symptoms: SymptomOnly[]
}

export interface SymptomOnly {
    symptomId: number,
    name: string,
    description: string,
}

export interface SymptomSlim {
    symptomId: number,
    name: string,
    description: string,
    features: FeatureSlim[]
}

export interface FeatureSlim {
    featureId: number,
    name: string,
    type: FeatureTypeInterface,
    allowableValues: string[]
}

///// client-specific interfaces /////

export type Mode = "Add" | "Edit";

export interface FeatureTypeInterface {
    name: string,
    pretty: string
}

export interface SymptomFormData {
    name: string,
    description: string,
    categoryId: number | "None" | "Add",
    [index: string]: any
}
