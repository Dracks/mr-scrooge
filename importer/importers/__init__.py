from importer.importers import caixa_bank

FORMAT_LIST = {
    caixa_bank.CaixaBankAccount.key: caixa_bank.CaixaBankAccount,
    caixa_bank.CaixaBankCard.key: caixa_bank.CaixaBankCard
}