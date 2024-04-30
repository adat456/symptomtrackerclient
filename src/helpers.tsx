function isInputMoreThanWhitespace(input: string) {
    return input.trim().length > 0 || "This field is required.";
}

export { isInputMoreThanWhitespace };