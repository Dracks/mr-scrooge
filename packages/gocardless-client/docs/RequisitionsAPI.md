# RequisitionsAPI

All URIs are relative to *https://bankaccountdata.gocardless.com*

Method | HTTP request | Description
------------- | ------------- | -------------
[**createRequisition**](RequisitionsAPI.md#createrequisition) | **POST** /api/v2/requisitions/ | 
[**deleteRequisitionById**](RequisitionsAPI.md#deleterequisitionbyid) | **DELETE** /api/v2/requisitions/{id}/ | 
[**requisitionById**](RequisitionsAPI.md#requisitionbyid) | **GET** /api/v2/requisitions/{id}/ | 
[**retrieveAllRequisitions**](RequisitionsAPI.md#retrieveallrequisitions) | **GET** /api/v2/requisitions/ | 


# **createRequisition**
```swift
    open class func createRequisition(requisitionRequest: RequisitionRequest, headers: HTTPHeaders = GoCardlessClientAPIConfiguration.shared.customHeaders, beforeSend: (inout ClientRequest) throws -> () = { _ in }) -> EventLoopFuture<CreateRequisition>
```



Create a new requisition

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import GoCardlessClient

let requisitionRequest = RequisitionRequest(redirect: "redirect_example", institutionId: "institutionId_example", agreement: 123, reference: "reference_example", userLanguage: "userLanguage_example", ssn: "ssn_example", accountSelection: false, redirectImmediate: false) // RequisitionRequest | 

RequisitionsAPI.createRequisition(requisitionRequest: requisitionRequest).whenComplete { result in
    switch result {
    case .failure(let error):
    // process error
    case .success(let response):
        switch response {
        // process decoded response value or raw ClientResponse
        case .http201(let value, let raw):
        case .http400(let value, let raw):
        case .http401(let value, let raw):
        case .http402(let value, let raw):
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
 **requisitionRequest** | [**RequisitionRequest**](RequisitionRequest.md) |  | 

### Return type

#### CreateRequisition

```swift
public enum CreateRequisition {
    case http201(value: SpectacularRequisition?, raw: ClientResponse)
    case http400(value: ModelErrorResponse?, raw: ClientResponse)
    case http401(value: ModelErrorResponse?, raw: ClientResponse)
    case http402(value: ModelErrorResponse?, raw: ClientResponse)
    case http403(value: ModelErrorResponse?, raw: ClientResponse)
    case http404(value: ModelErrorResponse?, raw: ClientResponse)
    case http429(value: ModelErrorResponse?, raw: ClientResponse)
    case http0(value: SpectacularRequisition?, raw: ClientResponse)
}
```

### Authorization

[jwtAuth](../README.md#jwtAuth)

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, multipart/form-data
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deleteRequisitionById**
```swift
    open class func deleteRequisitionById(id: UUID, headers: HTTPHeaders = GoCardlessClientAPIConfiguration.shared.customHeaders, beforeSend: (inout ClientRequest) throws -> () = { _ in }) -> EventLoopFuture<DeleteRequisitionById>
```



Delete requisition and its end user agreement

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import GoCardlessClient

let id = 987 // UUID | A UUID string identifying this requisition.

RequisitionsAPI.deleteRequisitionById(id: id).whenComplete { result in
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
        case .http429(let value, let raw):
        case .http0(let value, let raw):
        }
    }
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **UUID** | A UUID string identifying this requisition. | 

### Return type

#### DeleteRequisitionById

```swift
public enum DeleteRequisitionById {
    case http200(value: SuccessfulDeleteResponse?, raw: ClientResponse)
    case http400(value: ModelErrorResponse?, raw: ClientResponse)
    case http401(value: ModelErrorResponse?, raw: ClientResponse)
    case http403(value: ModelErrorResponse?, raw: ClientResponse)
    case http404(value: ModelErrorResponse?, raw: ClientResponse)
    case http429(value: ModelErrorResponse?, raw: ClientResponse)
    case http0(value: SuccessfulDeleteResponse?, raw: ClientResponse)
}
```

### Authorization

[jwtAuth](../README.md#jwtAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **requisitionById**
```swift
    open class func requisitionById(id: UUID, headers: HTTPHeaders = GoCardlessClientAPIConfiguration.shared.customHeaders, beforeSend: (inout ClientRequest) throws -> () = { _ in }) -> EventLoopFuture<RequisitionById>
```



Retrieve a requisition by ID

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import GoCardlessClient

let id = 987 // UUID | A UUID string identifying this requisition.

RequisitionsAPI.requisitionById(id: id).whenComplete { result in
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
        case .http429(let value, let raw):
        case .http0(let value, let raw):
        }
    }
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **UUID** | A UUID string identifying this requisition. | 

### Return type

#### RequisitionById

```swift
public enum RequisitionById {
    case http200(value: Requisition?, raw: ClientResponse)
    case http400(value: ModelErrorResponse?, raw: ClientResponse)
    case http401(value: ModelErrorResponse?, raw: ClientResponse)
    case http403(value: ModelErrorResponse?, raw: ClientResponse)
    case http404(value: ModelErrorResponse?, raw: ClientResponse)
    case http429(value: ModelErrorResponse?, raw: ClientResponse)
    case http0(value: Requisition?, raw: ClientResponse)
}
```

### Authorization

[jwtAuth](../README.md#jwtAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **retrieveAllRequisitions**
```swift
    open class func retrieveAllRequisitions(limit: Int? = nil, offset: Int? = nil, headers: HTTPHeaders = GoCardlessClientAPIConfiguration.shared.customHeaders, beforeSend: (inout ClientRequest) throws -> () = { _ in }) -> EventLoopFuture<RetrieveAllRequisitions>
```



Retrieve all requisitions belonging to the company

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import GoCardlessClient

let limit = 987 // Int | Number of results to return per page. (optional) (default to 100)
let offset = 987 // Int | The initial zero-based index from which to return the results. (optional) (default to 0)

RequisitionsAPI.retrieveAllRequisitions(limit: limit, offset: offset).whenComplete { result in
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
        case .http429(let value, let raw):
        case .http0(let value, let raw):
        }
    }
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **limit** | **Int** | Number of results to return per page. | [optional] [default to 100]
 **offset** | **Int** | The initial zero-based index from which to return the results. | [optional] [default to 0]

### Return type

#### RetrieveAllRequisitions

```swift
public enum RetrieveAllRequisitions {
    case http200(value: PaginatedRequisitionList?, raw: ClientResponse)
    case http400(value: ModelErrorResponse?, raw: ClientResponse)
    case http401(value: ModelErrorResponse?, raw: ClientResponse)
    case http403(value: ModelErrorResponse?, raw: ClientResponse)
    case http404(value: ModelErrorResponse?, raw: ClientResponse)
    case http429(value: ModelErrorResponse?, raw: ClientResponse)
    case http0(value: PaginatedRequisitionList?, raw: ClientResponse)
}
```

### Authorization

[jwtAuth](../README.md#jwtAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

