# EndUserAgreementRequest

## Properties
Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**institutionId** | **String** | an Institution ID for this EUA | 
**maxHistoricalDays** | **Int** | Maximum number of days of transaction data to retrieve. | [optional] [default to 90]
**accessValidForDays** | **Int** | Number of days from acceptance that the access can be used. | [optional] [default to 90]
**accessScope** | **[JSONValue]** | Array containing one or several values of [&#39;balances&#39;, &#39;details&#39;, &#39;transactions&#39;] | [optional] 
**reconfirmation** | **Bool** | if this agreement can be extended. Supported by GB banks only. | [optional] [default to false]

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


