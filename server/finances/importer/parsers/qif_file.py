from qifparse.parser import QifParser


def trans_to_dict(transaction):
    return {
        "date": transaction.date,
        "num": transaction.num,
        "amount": transaction.amount,
        "cleared": transaction.cleared,
        "payee": transaction.payee,
        "memo": transaction.memo,
        "address": transaction.address,
        "category": transaction.category,
        "to_account": transaction.to_account
    }


def QifFile(filename):
    qif = QifParser.parse(open(filename))
    for trans_group in qif.get_transactions():
        for transaction in trans_group:
            data=trans_to_dict(transaction)
            yield data

