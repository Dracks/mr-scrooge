# Requisition

## Properties
Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **UUID** |  | [optional] [readonly] 
**created** | **Date** | The date &amp; time at which the requisition was created. | [optional] [readonly] 
**redirect** | **String** | redirect URL to your application after end-user authorization with ASPSP | 
**status** | [**StatusEnum**](StatusEnum.md) | status of this requisition | [optional] [readonly] 
**institutionId** | **String** | an Institution ID for this Requisition | 
**agreement** | **UUID** | EUA associated with this requisition | [optional] 
**reference** | **String** | additional ID to identify the end user | [optional] 
**accounts** | **[UUID]** | array of account IDs retrieved within a scope of this requisition | [optional] [readonly] 
**userLanguage** | **String** | A two-letter country code (ISO 639-1) | [optional] 
**link** | **String** | link to initiate authorization with Institution | [optional] [readonly] [default to "https://ob.gocardless.com/psd2/start/3fa85f64-5717-4562-b3fc-2c963f66afa6/SANDBOXFINANCE_SFIN0000"]
**ssn** | **String** | optional SSN field to verify ownership of the account | [optional] 
**accountSelection** | **Bool** | option to enable account selection view for the end user | [optional] [default to false]
**redirectImmediate** | **Bool** | enable redirect back to the client after account list received | [optional] [default to false]

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


