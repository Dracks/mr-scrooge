# RequisitionRequest

## Properties
Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**redirect** | **String** | redirect URL to your application after end-user authorization with ASPSP | 
**institutionId** | **String** | an Institution ID for this Requisition | 
**agreement** | **UUID** | EUA associated with this requisition | [optional] 
**reference** | **String** | additional ID to identify the end user | [optional] 
**userLanguage** | **String** | A two-letter country code (ISO 639-1) | [optional] 
**ssn** | **String** | optional SSN field to verify ownership of the account | [optional] 
**accountSelection** | **Bool** | option to enable account selection view for the end user | [optional] [default to false]
**redirectImmediate** | **Bool** | enable redirect back to the client after account list received | [optional] [default to false]

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


