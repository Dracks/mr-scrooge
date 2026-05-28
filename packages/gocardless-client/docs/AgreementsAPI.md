# AgreementsAPI

All URIs are relative to *https://bankaccountdata.gocardless.com*

Method | HTTP request | Description
------------- | ------------- | -------------
[**acceptEUA**](AgreementsAPI.md#accepteua) | **PUT** /api/v2/agreements/enduser/{id}/accept/ | 
[**createEUA**](AgreementsAPI.md#createeua) | **POST** /api/v2/agreements/enduser/ | 
[**createEUAReconfirmation**](AgreementsAPI.md#createeuareconfirmation) | **POST** /api/v2/agreements/enduser/{id}/reconfirm/ | 
[**deleteEUAById**](AgreementsAPI.md#deleteeuabyid) | **DELETE** /api/v2/agreements/enduser/{id}/ | 
[**retrieveAllAgreements**](AgreementsAPI.md#retrieveallagreements) | **GET** /api/v2/agreements/enduser/ | 
[**retrieveEUAById**](AgreementsAPI.md#retrieveeuabyid) | **GET** /api/v2/agreements/enduser/{id}/ | 
[**retrieveEUAReconfirmation**](AgreementsAPI.md#retrieveeuareconfirmation) | **GET** /api/v2/agreements/enduser/{id}/reconfirm/ | 


# **acceptEUA**
```swift
    open class func acceptEUA(id: UUID, enduserAcceptanceDetailsRequest: EnduserAcceptanceDetailsRequest, headers: HTTPHeaders = GoCardlessClientAPIConfiguration.shared.customHeaders, beforeSend: (inout ClientRequest) throws -> () = { _ in }) -> EventLoopFuture<AcceptEUA>
```



Accept an end-user agreement via the API

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import GoCardlessClient

let id = 987 // UUID | A UUID string identifying this end user agreement.
let enduserAcceptanceDetailsRequest = EnduserAcceptanceDetailsRequest(userAgent: "userAgent_example", ipAddress: "ipAddress_example") // EnduserAcceptanceDetailsRequest | 

AgreementsAPI.acceptEUA(id: id, enduserAcceptanceDetailsRequest: enduserAcceptanceDetailsRequest).whenComplete { result in
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
        case .http405(let value, let raw):
        case .http429(let value, let raw):
        case .http0(let value, let raw):
        }
    }
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **UUID** | A UUID string identifying this end user agreement. | 
 **enduserAcceptanceDetailsRequest** | [**EnduserAcceptanceDetailsRequest**](EnduserAcceptanceDetailsRequest.md) |  | 

### Return type

#### AcceptEUA

```swift
public enum AcceptEUA {
    case http200(value: EndUserAgreement?, raw: ClientResponse)
    case http400(value: ModelErrorResponse?, raw: ClientResponse)
    case http401(value: ModelErrorResponse?, raw: ClientResponse)
    case http403(value: ModelErrorResponse?, raw: ClientResponse)
    case http404(value: ModelErrorResponse?, raw: ClientResponse)
    case http405(value: ModelErrorResponse?, raw: ClientResponse)
    case http429(value: ModelErrorResponse?, raw: ClientResponse)
    case http0(value: EndUserAgreement?, raw: ClientResponse)
}
```

### Authorization

[jwtAuth](../README.md#jwtAuth)

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, multipart/form-data
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **createEUA**
```swift
    open class func createEUA(endUserAgreementRequest: EndUserAgreementRequest, headers: HTTPHeaders = GoCardlessClientAPIConfiguration.shared.customHeaders, beforeSend: (inout ClientRequest) throws -> () = { _ in }) -> EventLoopFuture<CreateEUA>
```



API endpoints related to end-user agreements.

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import GoCardlessClient

let endUserAgreementRequest = EndUserAgreementRequest(institutionId: "institutionId_example", maxHistoricalDays: 123, accessValidForDays: 123, accessScope: [123], reconfirmation: false) // EndUserAgreementRequest | 

AgreementsAPI.createEUA(endUserAgreementRequest: endUserAgreementRequest).whenComplete { result in
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
        case .http429(let value, let raw):
        case .http0(let value, let raw):
        }
    }
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **endUserAgreementRequest** | [**EndUserAgreementRequest**](EndUserAgreementRequest.md) |  | 

### Return type

#### CreateEUA

```swift
public enum CreateEUA {
    case http201(value: EndUserAgreement?, raw: ClientResponse)
    case http400(value: ModelErrorResponse?, raw: ClientResponse)
    case http401(value: ModelErrorResponse?, raw: ClientResponse)
    case http402(value: ModelErrorResponse?, raw: ClientResponse)
    case http403(value: ModelErrorResponse?, raw: ClientResponse)
    case http429(value: ModelErrorResponse?, raw: ClientResponse)
    case http0(value: EndUserAgreement?, raw: ClientResponse)
}
```

### Authorization

[jwtAuth](../README.md#jwtAuth)

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, multipart/form-data
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **createEUAReconfirmation**
```swift
    open class func createEUAReconfirmation(id: UUID, reconfirmationRetrieveRequest: ReconfirmationRetrieveRequest? = nil, headers: HTTPHeaders = GoCardlessClientAPIConfiguration.shared.customHeaders, beforeSend: (inout ClientRequest) throws -> () = { _ in }) -> EventLoopFuture<CreateEUAReconfirmation>
```



Create EUA reconfirmation

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import GoCardlessClient

let id = 987 // UUID | A UUID string identifying this end user agreement.
let reconfirmationRetrieveRequest = ReconfirmationRetrieveRequest(redirect: "redirect_example") // ReconfirmationRetrieveRequest |  (optional)

AgreementsAPI.createEUAReconfirmation(id: id, reconfirmationRetrieveRequest: reconfirmationRetrieveRequest).whenComplete { result in
    switch result {
    case .failure(let error):
    // process error
    case .success(let response):
        switch response {
        // process decoded response value or raw ClientResponse
        case .http201(let value, let raw):
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
 **id** | **UUID** | A UUID string identifying this end user agreement. | 
 **reconfirmationRetrieveRequest** | [**ReconfirmationRetrieveRequest**](ReconfirmationRetrieveRequest.md) |  | [optional] 

### Return type

#### CreateEUAReconfirmation

```swift
public enum CreateEUAReconfirmation {
    case http201(value: ReconfirmationRetrieve?, raw: ClientResponse)
    case http400(value: ModelErrorResponse?, raw: ClientResponse)
    case http401(value: ModelErrorResponse?, raw: ClientResponse)
    case http403(value: ModelErrorResponse?, raw: ClientResponse)
    case http404(value: ModelErrorResponse?, raw: ClientResponse)
    case http429(value: ModelErrorResponse?, raw: ClientResponse)
    case http0(value: ReconfirmationRetrieve?, raw: ClientResponse)
}
```

### Authorization

[jwtAuth](../README.md#jwtAuth)

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, multipart/form-data
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deleteEUAById**
```swift
    open class func deleteEUAById(id: UUID, headers: HTTPHeaders = GoCardlessClientAPIConfiguration.shared.customHeaders, beforeSend: (inout ClientRequest) throws -> () = { _ in }) -> EventLoopFuture<DeleteEUAById>
```



Delete an end user agreement

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import GoCardlessClient

let id = 987 // UUID | A UUID string identifying this end user agreement.

AgreementsAPI.deleteEUAById(id: id).whenComplete { result in
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
 **id** | **UUID** | A UUID string identifying this end user agreement. | 

### Return type

#### DeleteEUAById

```swift
public enum DeleteEUAById {
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

# **retrieveAllAgreements**
```swift
    open class func retrieveAllAgreements(limit: Int? = nil, offset: Int? = nil, headers: HTTPHeaders = GoCardlessClientAPIConfiguration.shared.customHeaders, beforeSend: (inout ClientRequest) throws -> () = { _ in }) -> EventLoopFuture<RetrieveAllAgreements>
```



Retrieve all End User Agreements belonging to the company

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import GoCardlessClient

let limit = 987 // Int | Number of results to return per page. (optional) (default to 100)
let offset = 987 // Int | The initial zero-based index from which to return the results. (optional) (default to 0)

AgreementsAPI.retrieveAllAgreements(limit: limit, offset: offset).whenComplete { result in
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
 **limit** | **Int** | Number of results to return per page. | [optional] [default to 100]
 **offset** | **Int** | The initial zero-based index from which to return the results. | [optional] [default to 0]

### Return type

#### RetrieveAllAgreements

```swift
public enum RetrieveAllAgreements {
    case http200(value: PaginatedEndUserAgreementList?, raw: ClientResponse)
    case http401(value: ModelErrorResponse?, raw: ClientResponse)
    case http403(value: ModelErrorResponse?, raw: ClientResponse)
    case http404(value: ModelErrorResponse?, raw: ClientResponse)
    case http429(value: ModelErrorResponse?, raw: ClientResponse)
    case http0(value: PaginatedEndUserAgreementList?, raw: ClientResponse)
}
```

### Authorization

[jwtAuth](../README.md#jwtAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **retrieveEUAById**
```swift
    open class func retrieveEUAById(id: UUID, headers: HTTPHeaders = GoCardlessClientAPIConfiguration.shared.customHeaders, beforeSend: (inout ClientRequest) throws -> () = { _ in }) -> EventLoopFuture<RetrieveEUAById>
```



Retrieve end user agreement by ID

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import GoCardlessClient

let id = 987 // UUID | A UUID string identifying this end user agreement.

AgreementsAPI.retrieveEUAById(id: id).whenComplete { result in
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
 **id** | **UUID** | A UUID string identifying this end user agreement. | 

### Return type

#### RetrieveEUAById

```swift
public enum RetrieveEUAById {
    case http200(value: EndUserAgreement?, raw: ClientResponse)
    case http400(value: ModelErrorResponse?, raw: ClientResponse)
    case http401(value: ModelErrorResponse?, raw: ClientResponse)
    case http403(value: ModelErrorResponse?, raw: ClientResponse)
    case http404(value: ModelErrorResponse?, raw: ClientResponse)
    case http429(value: ModelErrorResponse?, raw: ClientResponse)
    case http0(value: EndUserAgreement?, raw: ClientResponse)
}
```

### Authorization

[jwtAuth](../README.md#jwtAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **retrieveEUAReconfirmation**
```swift
    open class func retrieveEUAReconfirmation(id: UUID, headers: HTTPHeaders = GoCardlessClientAPIConfiguration.shared.customHeaders, beforeSend: (inout ClientRequest) throws -> () = { _ in }) -> EventLoopFuture<RetrieveEUAReconfirmation>
```



Retrieve EUA reconfirmation

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import GoCardlessClient

let id = 987 // UUID | A UUID string identifying this end user agreement.

AgreementsAPI.retrieveEUAReconfirmation(id: id).whenComplete { result in
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
 **id** | **UUID** | A UUID string identifying this end user agreement. | 

### Return type

#### RetrieveEUAReconfirmation

```swift
public enum RetrieveEUAReconfirmation {
    case http200(value: ReconfirmationRetrieve?, raw: ClientResponse)
    case http400(value: ModelErrorResponse?, raw: ClientResponse)
    case http401(value: ModelErrorResponse?, raw: ClientResponse)
    case http403(value: ModelErrorResponse?, raw: ClientResponse)
    case http404(value: ModelErrorResponse?, raw: ClientResponse)
    case http429(value: ModelErrorResponse?, raw: ClientResponse)
    case http0(value: ReconfirmationRetrieve?, raw: ClientResponse)
}
```

### Authorization

[jwtAuth](../README.md#jwtAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

