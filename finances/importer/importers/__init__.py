from finances.importer.importers import (caixa_bank, caixa_enginyers, edenred,
                                         n26, qif)

FORMAT_LIST = {
    caixa_bank.CaixaBankAccount.key: caixa_bank.CaixaBankAccount,
    caixa_bank.CaixaBankCard.key: caixa_bank.CaixaBankCard,
    caixa_enginyers.CaixaEnginyersAccount.key: caixa_enginyers.CaixaEnginyersAccount,
    caixa_enginyers.CaixaEnginyersCredit.key: caixa_enginyers.CaixaEnginyersCredit,
    edenred.TicketRestaurant.key: edenred.TicketRestaurant,
    n26.Number26.key: n26.Number26,
    qif.Qif.key: qif.Qif
}
