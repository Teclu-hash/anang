//format number as peso
export const peso = (n) => {
    return "₱" + Number(n || 0).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

//today as yyyy-mm-dd (for date inputs)
export const today = () => new Date().toISOString().slice(0, 10)
