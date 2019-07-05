from finances.importer.importers import caixa_bank, edenred, n26, qif

FORMAT_LIST = {
    caixa_bank.CaixaBankAccount.key: caixa_bank.CaixaBankAccount,
    caixa_bank.CaixaBankCard.key: caixa_bank.CaixaBankCard,
    edenred.TicketRestaurant.key: edenred.TicketRestaurant,
    n26.Number26.key: n26.Number26,
    qif.Qif.key: qif.Qif
}