// https://www.sohamkamani.com/javascript/enums/

export default class FeatureType {
    name: string;
    pretty: string;
    
    constructor(name: string, pretty: string) {
        this.name = name;
        this.pretty = pretty;
    }

    static Scale = new FeatureType("SCALE", "Scale");
    static Boolean = new FeatureType("BOOL", "Boolean");
    static Time = new FeatureType("TIME", "Time");
    static Checkbox = new FeatureType("CHECKBOX", "Checkboxes");
    static Radiobutton = new FeatureType("RADIOBTN", "Radio buttons");
    static Freetext = new FeatureType("FREETEXT", "Free text");
}