// Les dates Sheets sont des jours depuis le 30/12/1899 (25569 = 01/01/1970), fuseau de la table : UTC.
export const serialToDate = (serial: number) =>
  new Date(Math.round((serial - 25569) * 86_400_000))

export const dateToSerial = (date: Date) => date.getTime() / 86_400_000 + 25569
