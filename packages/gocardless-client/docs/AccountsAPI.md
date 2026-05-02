# AccountsAPI

All URIs are relative to *https://bankaccountdata.gocardless.com*

Method | HTTP request | Description
------------- | ------------- | -------------
[**retrieveAccountBalances**](AccountsAPI.md#retrieveaccountbalances) | **GET** /api/v2/accounts/{id}/balances/ | 
[**retrieveAccountDetails**](AccountsAPI.md#retrieveaccountdetails) | **GET** /api/v2/accounts/{id}/details/ | 
[**retrieveAccountMetadata**](AccountsAPI.md#retrieveaccountmetadata) | **GET** /api/v2/accounts/{id}/ | 
[**retrieveAccountTransactions**](AccountsAPI.md#retrieveaccounttransactions) | **GET** /api/v2/accounts/{id}/transactions/ | 


# **retrieveAccountBalances**
```swift
    open class func retrieveAccountBalances(id: String, completion: @escaping (_ data: AccountBalance?, _ error: Error?) -> Void)
```



Access account balances.  Balances will be returned in Berlin Group PSD2 format.

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import GoCardlessClient

let id = "id_example" // String | 

AccountsAPI.retrieveAccountBalances(id: id) { (response, error) in
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

[**AccountBalance**](AccountBalance.md)

### Authorization

[jwtAuth](../README.md#jwtAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **retrieveAccountDetails**
```swift
    open class func retrieveAccountDetails(id: String, completion: @escaping (_ data: AccountDetail?, _ error: Error?) -> Void)
```



Access account details.  Account details will be returned in Berlin Group PSD2 format.

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import GoCardlessClient

let id = "id_example" // String | 

AccountsAPI.retrieveAccountDetails(id: id) { (response, error) in
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

[**AccountDetail**](AccountDetail.md)

### Authorization

[jwtAuth](../README.md#jwtAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **retrieveAccountMetadata**
```swift
    open class func retrieveAccountMetadata(id: String, completion: @escaping (_ data: Account?, _ error: Error?) -> Void)
```



Access account metadata.  Information about the account record, such as the processing status and IBAN.  Account status is recalculated based on the error count in the latest req.

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import GoCardlessClient

let id = "id_example" // String | 

AccountsAPI.retrieveAccountMetadata(id: id) { (response, error) in
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

[**Account**](Account.md)

### Authorization

[jwtAuth](../README.md#jwtAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **retrieveAccountTransactions**
```swift
    open class func retrieveAccountTransactions(id: String, dateFrom: Date? = nil, dateTo: Date? = nil, completion: @escaping (_ data: AccountTransactions?, _ error: Error?) -> Void)
```



Access account transactions.  Transactions will be returned in Berlin Group PSD2 format.

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import GoCardlessClient

let id = "id_example" // String | 
let dateFrom = Date() // Date |  (optional)
let dateTo = Date() // Date |  (optional)

AccountsAPI.retrieveAccountTransactions(id: id, dateFrom: dateFrom, dateTo: dateTo) { (response, error) in
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
 **dateFrom** | **Date** |  | [optional] 
 **dateTo** | **Date** |  | [optional] 

### Return type

[**AccountTransactions**](AccountTransactions.md)

### Authorization

[jwtAuth](../README.md#jwtAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

