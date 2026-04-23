# TransactionSchema

## Properties
Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**transactionId** | **String** | transactionId | [optional] 
**entryReference** | **String** | entryReference | [optional] 
**endToEndId** | **String** | endToEndId | [optional] 
**mandateId** | **String** | mandateId | [optional] 
**checkId** | **String** | checkId | [optional] 
**creditorId** | **String** | creditorId | [optional] 
**bookingDate** | **String** | bookingDate | [optional] 
**valueDate** | **String** | valueDate | [optional] 
**bookingDateTime** | **String** | bookingDateTime | [optional] 
**valueDateTime** | **String** | valueDateTime | [optional] 
**transactionAmount** | [**TransactionAmountSchema**](TransactionAmountSchema.md) | transactionAmount | 
**currencyExchange** | [CurrencyExchangeSchema] |  | [optional] 
**creditorName** | **String** | creditorName | [optional] 
**creditorAccount** | [**AccountSchema**](AccountSchema.md) | creditorAccount | [optional] 
**ultimateCreditor** | **String** | ultimateCreditor | [optional] 
**debtorName** | **String** | debtorName | [optional] 
**debtorAccount** | [**AccountSchema**](AccountSchema.md) | debtorAccount | [optional] 
**ultimateDebtor** | **String** | ultimateDebtor | [optional] 
**remittanceInformationUnstructured** | **String** | remittanceInformationUnstructured | [optional] 
**remittanceInformationUnstructuredArray** | **[String]** | remittanceInformationUnstructuredArray | [optional] 
**remittanceInformationStructured** | **String** | remittanceInformationStructured | [optional] 
**remittanceInformationStructuredArray** | **[String]** | remittanceInformationStructuredArray | [optional] 
**additionalInformation** | **String** | additionalInformation | [optional] 
**purposeCode** | **String** | purposeCode | [optional] 
**bankTransactionCode** | **String** | bankTransactionCode | [optional] 
**proprietaryBankTransactionCode** | **String** | proprietaryBankTransactionCode | [optional] 
**internalTransactionId** | **String** | internalTransactionId | [optional] 
**balanceAfterTransaction** | [**BalanceAfterTransactionSchema**](BalanceAfterTransactionSchema.md) | balanceAfterTransaction | [optional] 

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


