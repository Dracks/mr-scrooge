# InstitutionsAPI

All URIs are relative to *https://bankaccountdata.gocardless.com*

Method | HTTP request | Description
------------- | ------------- | -------------
[**retrieveAllSupportedInstitutionsInAGivenCountry**](InstitutionsAPI.md#retrieveallsupportedinstitutionsinagivencountry) | **GET** /api/v2/institutions/ | 
[**retrieveInstitution**](InstitutionsAPI.md#retrieveinstitution) | **GET** /api/v2/institutions/{id}/ | 


# **retrieveAllSupportedInstitutionsInAGivenCountry**
```swift
    open class func retrieveAllSupportedInstitutionsInAGivenCountry(accessScopesSupported: String? = nil, accountSelectionSupported: String? = nil, businessAccountsSupported: String? = nil, cardAccountsSupported: String? = nil, corporateAccountsSupported: String? = nil, country: String? = nil, pendingTransactionsSupported: String? = nil, privateAccountsSupported: String? = nil, readDebtorAccountSupported: String? = nil, readRefundAccountSupported: String? = nil, separateContinuousHistoryConsentSupported: String? = nil, ssnVerificationSupported: String? = nil, completion: @escaping (_ data: [Integration]?, _ error: Error?) -> Void)
```



List all available institutions

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let accessScopesSupported = "accessScopesSupported_example" // String | Boolean value, indicating if access scopes are supported (optional)
let accountSelectionSupported = "accountSelectionSupported_example" // String | Boolean value, indicating if account selection is supported (optional)
let businessAccountsSupported = "businessAccountsSupported_example" // String | Boolean value, indicating if business accounts are supported (optional)
let cardAccountsSupported = "cardAccountsSupported_example" // String | Boolean value, indicating if card accounts are supported (optional)
let corporateAccountsSupported = "corporateAccountsSupported_example" // String | Boolean value, indicating if corporate accounts are supported (optional)
let country = "country_example" // String | ISO 3166 two-character country code (optional)
let pendingTransactionsSupported = "pendingTransactionsSupported_example" // String | Boolean value, indicating if pending transactions are supported (optional)
let privateAccountsSupported = "privateAccountsSupported_example" // String | Boolean value, indicating if private accounts are supported (optional)
let readDebtorAccountSupported = "readDebtorAccountSupported_example" // String | Boolean value, indicating if debtor account can be read before submitting payment (optional)
let readRefundAccountSupported = "readRefundAccountSupported_example" // String | Boolean value, indicating if read refund account is supported (optional)
let separateContinuousHistoryConsentSupported = "separateContinuousHistoryConsentSupported_example" // String | Boolean value, indicating if separate consent for continuous history is supported (optional)
let ssnVerificationSupported = "ssnVerificationSupported_example" // String | Boolean value, indicating if ssn verification is supported (optional)

InstitutionsAPI.retrieveAllSupportedInstitutionsInAGivenCountry(accessScopesSupported: accessScopesSupported, accountSelectionSupported: accountSelectionSupported, businessAccountsSupported: businessAccountsSupported, cardAccountsSupported: cardAccountsSupported, corporateAccountsSupported: corporateAccountsSupported, country: country, pendingTransactionsSupported: pendingTransactionsSupported, privateAccountsSupported: privateAccountsSupported, readDebtorAccountSupported: readDebtorAccountSupported, readRefundAccountSupported: readRefundAccountSupported, separateContinuousHistoryConsentSupported: separateContinuousHistoryConsentSupported, ssnVerificationSupported: ssnVerificationSupported) { (response, error) in
    guard error == nil else {
        print(error)
        return
    }

    if (response) {
        dump(response)
    }
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **accessScopesSupported** | **String** | Boolean value, indicating if access scopes are supported | [optional] 
 **accountSelectionSupported** | **String** | Boolean value, indicating if account selection is supported | [optional] 
 **businessAccountsSupported** | **String** | Boolean value, indicating if business accounts are supported | [optional] 
 **cardAccountsSupported** | **String** | Boolean value, indicating if card accounts are supported | [optional] 
 **corporateAccountsSupported** | **String** | Boolean value, indicating if corporate accounts are supported | [optional] 
 **country** | **String** | ISO 3166 two-character country code | [optional] 
 **pendingTransactionsSupported** | **String** | Boolean value, indicating if pending transactions are supported | [optional] 
 **privateAccountsSupported** | **String** | Boolean value, indicating if private accounts are supported | [optional] 
 **readDebtorAccountSupported** | **String** | Boolean value, indicating if debtor account can be read before submitting payment | [optional] 
 **readRefundAccountSupported** | **String** | Boolean value, indicating if read refund account is supported | [optional] 
 **separateContinuousHistoryConsentSupported** | **String** | Boolean value, indicating if separate consent for continuous history is supported | [optional] 
 **ssnVerificationSupported** | **String** | Boolean value, indicating if ssn verification is supported | [optional] 

### Return type

[**[Integration]**](Integration.md)

### Authorization

[jwtAuth](../README.md#jwtAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **retrieveInstitution**
```swift
    open class func retrieveInstitution(id: String, completion: @escaping (_ data: IntegrationRetrieve?, _ error: Error?) -> Void)
```



Get details about a specific Institution and its supported features

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let id = "id_example" // String | 

InstitutionsAPI.retrieveInstitution(id: id) { (response, error) in
    guard error == nil else {
        print(error)
        return
    }

    if (response) {
        dump(response)
    }
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String** |  | 

### Return type

[**IntegrationRetrieve**](IntegrationRetrieve.md)

### Authorization

[jwtAuth](../README.md#jwtAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

