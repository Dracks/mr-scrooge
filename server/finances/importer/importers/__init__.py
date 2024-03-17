from finances.importer.importers import (caixa_bank, caixa_enginyers, edenred,
                                         n26, qif, commerz_bank, commerz_bank_2024_en)

FORMAT_LIST = {
    # caixa_bank.CaixaBankAccount.key: caixa_bank.CaixaBankAccount,
    caixa_bank.CaixaBankAccount2020.key: caixa_bank.CaixaBankAccount2020,
    caixa_bank.CaixaBankCard.key: caixa_bank.CaixaBankCard,
    caixa_bank.CaixaBankCard2020.key: caixa_bank.CaixaBankCard2020,
    commerz_bank.CommerzBank.key: commerz_bank.CommerzBank,
    commerz_bank_2024_en.CommerzBank2024en.key: commerz_bank_2024_en.CommerzBank2024en,
    caixa_enginyers.CaixaEnginyersAccount.key: caixa_enginyers.CaixaEnginyersAccount,
    caixa_enginyers.CaixaEnginyersCredit.key: caixa_enginyers.CaixaEnginyersCredit,
    edenred.TicketRestaurant.key: edenred.TicketRestaurant,
    n26.Number26.key: n26.Number26,
    qif.Qif.key: qif.Qif
}
