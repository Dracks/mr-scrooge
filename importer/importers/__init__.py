from importer.importers import caixa_bank, edenred

FORMAT_LIST = {
    caixa_bank.CaixaBankAccount.key: caixa_bank.CaixaBankAccount,
    caixa_bank.CaixaBankCard.key: caixa_bank.CaixaBankCard,
    edenred.TicketRestaurant.key: edenred.TicketRestaurant,
    caixa_bank.CaixaBankCardOld.key: caixa_bank.CaixaBankCardOld
}