export function getApiErrorMessage(
    error: any,
    fallback: string,
): string {

    const detail = error?.response?.data?.detail;

    if (typeof detail === "string") {
        return detail;
    }

    if (Array.isArray(detail)) {

        return detail
            .map((item) => {
                if (typeof item === "string") {
                    return item;
                }

                return item?.msg ?? "Validation error";
            })
            .join(", ");
    }

    return fallback;
}