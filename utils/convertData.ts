export const convertDate = (data: number) => {
    const endDate = new Date(data)
    const formattedDate = endDate.toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
    });
    return formattedDate;
}