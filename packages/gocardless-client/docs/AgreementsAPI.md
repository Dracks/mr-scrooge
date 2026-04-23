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
    open class func acceptEUA(id: UUID, enduserAcceptanceDetailsRequest: EnduserAcceptanceDetailsRequest, completion: @escaping (_ data: EndUserAgreement?, _ error: Error?) -> Void)
```



Accept an end-user agreement via the API

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let id = 987 // UUID | A UUID string identifying this end user agreement.
let enduserAcceptanceDetailsRequest = EnduserAcceptanceDetailsRequest(userAgent: "userAgent_example", ipAddress: "ipAddress_example") // EnduserAcceptanceDetailsRequest | 

AgreementsAPI.acceptEUA(id: id, enduserAcceptanceDetailsRequest: enduserAcceptanceDetailsRequest) { (response, error) in
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
 **id** | **UUID** | A UUID string identifying this end user agreement. | 
 **enduserAcceptanceDetailsRequest** | [**EnduserAcceptanceDetailsRequest**](EnduserAcceptanceDetailsRequest.md) |  | 

### Return type

[**EndUserAgreement**](EndUserAgreement.md)

### Authorization

[jwtAuth](../README.md#jwtAuth)

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, multipart/form-data
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **createEUA**
```swift
    open class func createEUA(endUserAgreementRequest: EndUserAgreementRequest, completion: @escaping (_ data: EndUserAgreement?, _ error: Error?) -> Void)
```



API endpoints related to end-user agreements.

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let endUserAgreementRequest = EndUserAgreementRequest(institutionId: "institutionId_example", maxHistoricalDays: 123, accessValidForDays: 123, accessScope: [123], reconfirmation: false) // EndUserAgreementRequest | 

AgreementsAPI.createEUA(endUserAgreementRequest: endUserAgreementRequest) { (response, error) in
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
 **endUserAgreementRequest** | [**EndUserAgreementRequest**](EndUserAgreementRequest.md) |  | 

### Return type

[**EndUserAgreement**](EndUserAgreement.md)

### Authorization

[jwtAuth](../README.md#jwtAuth)

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, multipart/form-data
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **createEUAReconfirmation**
```swift
    open class func createEUAReconfirmation(id: UUID, reconfirmationRetrieveRequest: ReconfirmationRetrieveRequest? = nil, completion: @escaping (_ data: ReconfirmationRetrieve?, _ error: Error?) -> Void)
```



Create EUA reconfirmation

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let id = 987 // UUID | A UUID string identifying this end user agreement.
let reconfirmationRetrieveRequest = ReconfirmationRetrieveRequest(redirect: "redirect_example") // ReconfirmationRetrieveRequest |  (optional)

AgreementsAPI.createEUAReconfirmation(id: id, reconfirmationRetrieveRequest: reconfirmationRetrieveRequest) { (response, error) in
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
 **id** | **UUID** | A UUID string identifying this end user agreement. | 
 **reconfirmationRetrieveRequest** | [**ReconfirmationRetrieveRequest**](ReconfirmationRetrieveRequest.md) |  | [optional] 

### Return type

[**ReconfirmationRetrieve**](ReconfirmationRetrieve.md)

### Authorization

[jwtAuth](../README.md#jwtAuth)

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, multipart/form-data
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deleteEUAById**
```swift
    open class func deleteEUAById(id: UUID, completion: @escaping (_ data: SuccessfulDeleteResponse?, _ error: Error?) -> Void)
```



Delete an end user agreement

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let id = 987 // UUID | A UUID string identifying this end user agreement.

AgreementsAPI.deleteEUAById(id: id) { (response, error) in
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
 **id** | **UUID** | A UUID string identifying this end user agreement. | 

### Return type

[**SuccessfulDeleteResponse**](SuccessfulDeleteResponse.md)

### Authorization

[jwtAuth](../README.md#jwtAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **retrieveAllAgreements**
```swift
    open class func retrieveAllAgreements(limit: Int? = nil, offset: Int? = nil, completion: @escaping (_ data: PaginatedEndUserAgreementList?, _ error: Error?) -> Void)
```



Retrieve all End User Agreements belonging to the company

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let limit = 987 // Int | Number of results to return per page. (optional) (default to 100)
let offset = 987 // Int | The initial zero-based index from which to return the results. (optional) (default to 0)

AgreementsAPI.retrieveAllAgreements(limit: limit, offset: offset) { (response, error) in
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
 **limit** | **Int** | Number of results to return per page. | [optional] [default to 100]
 **offset** | **Int** | The initial zero-based index from which to return the results. | [optional] [default to 0]

### Return type

[**PaginatedEndUserAgreementList**](PaginatedEndUserAgreementList.md)

### Authorization

[jwtAuth](../README.md#jwtAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **retrieveEUAById**
```swift
    open class func retrieveEUAById(id: UUID, completion: @escaping (_ data: EndUserAgreement?, _ error: Error?) -> Void)
```



Retrieve end user agreement by ID

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let id = 987 // UUID | A UUID string identifying this end user agreement.

AgreementsAPI.retrieveEUAById(id: id) { (response, error) in
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
 **id** | **UUID** | A UUID string identifying this end user agreement. | 

### Return type

[**EndUserAgreement**](EndUserAgreement.md)

### Authorization

[jwtAuth](../README.md#jwtAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **retrieveEUAReconfirmation**
```swift
    open class func retrieveEUAReconfirmation(id: UUID, completion: @escaping (_ data: ReconfirmationRetrieve?, _ error: Error?) -> Void)
```



Retrieve EUA reconfirmation

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let id = 987 // UUID | A UUID string identifying this end user agreement.

AgreementsAPI.retrieveEUAReconfirmation(id: id) { (response, error) in
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
 **id** | **UUID** | A UUID string identifying this end user agreement. | 

### Return type

[**ReconfirmationRetrieve**](ReconfirmationRetrieve.md)

### Authorization

[jwtAuth](../README.md#jwtAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

