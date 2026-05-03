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
    open class func retrieveAccountBalances(id: String, headers: HTTPHeaders = GoCardlessClientAPIConfiguration.shared.customHeaders, beforeSend: (inout ClientRequest) throws -> () = { _ in }) -> EventLoopFuture<RetrieveAccountBalances>
```



Access account balances.  Balances will be returned in Berlin Group PSD2 format.

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import GoCardlessClient

let id = "id_example" // String | 

AccountsAPI.retrieveAccountBalances(id: id).whenComplete { result in
    switch result {
    case .failure(let error):
    // process error
    case .success(let response):
        switch response {
        // process decoded response value or raw ClientResponse
        case .http200(let value, let raw):
        case .http400(let value, let raw):
        case .http401(let value, let raw):
        case .http403(let value, let raw):
        case .http404(let value, let raw):
        case .http409(let value, let raw):
        case .http429(let value, let raw):
        case .http500(let value, let raw):
        case .http503(let value, let raw):
        case .http0(let value, let raw):
        }
    }
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String** |  | 

### Return type

#### RetrieveAccountBalances

```swift
public enum RetrieveAccountBalances {
    case http200(value: AccountBalance?, raw: ClientResponse)
    case http400(value: ModelErrorResponse?, raw: ClientResponse)
    case http401(value: ModelErrorResponse?, raw: ClientResponse)
    case http403(value: ModelErrorResponse?, raw: ClientResponse)
    case http404(value: ModelErrorResponse?, raw: ClientResponse)
    case http409(value: ModelErrorResponse?, raw: ClientResponse)
    case http429(value: ModelErrorResponse?, raw: ClientResponse)
    case http500(value: ModelErrorResponse?, raw: ClientResponse)
    case http503(value: ModelErrorResponse?, raw: ClientResponse)
    case http0(value: AccountBalance?, raw: ClientResponse)
}
```

### Authorization

[jwtAuth](../README.md#jwtAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **retrieveAccountDetails**
```swift
    open class func retrieveAccountDetails(id: String, headers: HTTPHeaders = GoCardlessClientAPIConfiguration.shared.customHeaders, beforeSend: (inout ClientRequest) throws -> () = { _ in }) -> EventLoopFuture<RetrieveAccountDetails>
```



Access account details.  Account details will be returned in Berlin Group PSD2 format.

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import GoCardlessClient

let id = "id_example" // String | 

AccountsAPI.retrieveAccountDetails(id: id).whenComplete { result in
    switch result {
    case .failure(let error):
    // process error
    case .success(let response):
        switch response {
        // process decoded response value or raw ClientResponse
        case .http200(let value, let raw):
        case .http400(let value, let raw):
        case .http401(let value, let raw):
        case .http403(let value, let raw):
        case .http404(let value, let raw):
        case .http409(let value, let raw):
        case .http429(let value, let raw):
        case .http500(let value, let raw):
        case .http503(let value, let raw):
        case .http0(let value, let raw):
        }
    }
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String** |  | 

### Return type

#### RetrieveAccountDetails

```swift
public enum RetrieveAccountDetails {
    case http200(value: AccountDetail?, raw: ClientResponse)
    case http400(value: ModelErrorResponse?, raw: ClientResponse)
    case http401(value: ModelErrorResponse?, raw: ClientResponse)
    case http403(value: ModelErrorResponse?, raw: ClientResponse)
    case http404(value: ModelErrorResponse?, raw: ClientResponse)
    case http409(value: ModelErrorResponse?, raw: ClientResponse)
    case http429(value: ModelErrorResponse?, raw: ClientResponse)
    case http500(value: ModelErrorResponse?, raw: ClientResponse)
    case http503(value: ModelErrorResponse?, raw: ClientResponse)
    case http0(value: AccountDetail?, raw: ClientResponse)
}
```

### Authorization

[jwtAuth](../README.md#jwtAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **retrieveAccountMetadata**
```swift
    open class func retrieveAccountMetadata(id: String, headers: HTTPHeaders = GoCardlessClientAPIConfiguration.shared.customHeaders, beforeSend: (inout ClientRequest) throws -> () = { _ in }) -> EventLoopFuture<RetrieveAccountMetadata>
```



Access account metadata.  Information about the account record, such as the processing status and IBAN.  Account status is recalculated based on the error count in the latest req.

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import GoCardlessClient

let id = "id_example" // String | 

AccountsAPI.retrieveAccountMetadata(id: id).whenComplete { result in
    switch result {
    case .failure(let error):
    // process error
    case .success(let response):
        switch response {
        // process decoded response value or raw ClientResponse
        case .http200(let value, let raw):
        case .http401(let value, let raw):
        case .http403(let value, let raw):
        case .http404(let value, let raw):
        case .http429(let value, let raw):
        case .http0(let value, let raw):
        }
    }
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String** |  | 

### Return type

#### RetrieveAccountMetadata

```swift
public enum RetrieveAccountMetadata {
    case http200(value: Account?, raw: ClientResponse)
    case http401(value: ModelErrorResponse?, raw: ClientResponse)
    case http403(value: ModelErrorResponse?, raw: ClientResponse)
    case http404(value: ModelErrorResponse?, raw: ClientResponse)
    case http429(value: ModelErrorResponse?, raw: ClientResponse)
    case http0(value: Account?, raw: ClientResponse)
}
```

### Authorization

[jwtAuth](../README.md#jwtAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **retrieveAccountTransactions**
```swift
    open class func retrieveAccountTransactions(id: String, dateFrom: Date? = nil, dateTo: Date? = nil, headers: HTTPHeaders = GoCardlessClientAPIConfiguration.shared.customHeaders, beforeSend: (inout ClientRequest) throws -> () = { _ in }) -> EventLoopFuture<RetrieveAccountTransactions>
```



Access account transactions.  Transactions will be returned in Berlin Group PSD2 format.

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import GoCardlessClient

let id = "id_example" // String | 
let dateFrom = Date() // Date |  (optional)
let dateTo = Date() // Date |  (optional)

AccountsAPI.retrieveAccountTransactions(id: id, dateFrom: dateFrom, dateTo: dateTo).whenComplete { result in
    switch result {
    case .failure(let error):
    // process error
    case .success(let response):
        switch response {
        // process decoded response value or raw ClientResponse
        case .http200(let value, let raw):
        case .http400(let value, let raw):
        case .http401(let value, let raw):
        case .http403(let value, let raw):
        case .http404(let value, let raw):
        case .http409(let value, let raw):
        case .http429(let value, let raw):
        case .http500(let value, let raw):
        case .http503(let value, let raw):
        case .http0(let value, let raw):
        }
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

#### RetrieveAccountTransactions

```swift
public enum RetrieveAccountTransactions {
    case http200(value: AccountTransactions?, raw: ClientResponse)
    case http400(value: ModelErrorResponse?, raw: ClientResponse)
    case http401(value: ModelErrorResponse?, raw: ClientResponse)
    case http403(value: ModelErrorResponse?, raw: ClientResponse)
    case http404(value: ModelErrorResponse?, raw: ClientResponse)
    case http409(value: ModelErrorResponse?, raw: ClientResponse)
    case http429(value: ModelErrorResponse?, raw: ClientResponse)
    case http500(value: ModelErrorResponse?, raw: ClientResponse)
    case http503(value: ModelErrorResponse?, raw: ClientResponse)
    case http0(value: AccountTransactions?, raw: ClientResponse)
}
```

### Authorization

[jwtAuth](../README.md#jwtAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

