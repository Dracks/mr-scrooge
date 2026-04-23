# ReconfirmationRetrieve

## Properties
Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**reconfirmationUrl** | **String** | Reconfirmation URL to be provided to PSU. | [optional] [readonly] 
**created** | **Date** | Reconfirmation creation time | [optional] [readonly] 
**urlValidFrom** | **Date** | Datetime from when PSU will be able to access reconfirmation URL. | [optional] [readonly] 
**urlValidTo** | **Date** | Datetime until when PSU will be able to access reconfirmation URL. | [optional] [readonly] 
**redirect** | **String** | Optional redirect URL for reconfirmation to override requisition&#39;s redirect. | [optional] 
**lastAccessed** | **Date** | Last time when reconfirmation was accessed (this does not mean that it was accessed by PSU). | [optional] [readonly] 
**lastSubmitted** | **Date** | Last time reconfirmation was submitted (it can be submitted multiple times). | [optional] [readonly] 
**accounts** | **JSONValue** | Dictionary of accounts and their reconfirm and reject timestamps | [optional] [readonly] 

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


