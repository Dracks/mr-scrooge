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
    open class func createRequisition(requisitionRequest: RequisitionRequest, completion: @escaping (_ data: SpectacularRequisition?, _ error: Error?) -> Void)
```



Create a new requisition

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let requisitionRequest = RequisitionRequest(redirect: "redirect_example", institutionId: "institutionId_example", agreement: 123, reference: "reference_example", userLanguage: "userLanguage_example", ssn: "ssn_example", accountSelection: false, redirectImmediate: false) // RequisitionRequest | 

RequisitionsAPI.createRequisition(requisitionRequest: requisitionRequest) { (response, error) in
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
 **requisitionRequest** | [**RequisitionRequest**](RequisitionRequest.md) |  | 

### Return type

[**SpectacularRequisition**](SpectacularRequisition.md)

### Authorization

[jwtAuth](../README.md#jwtAuth)

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, multipart/form-data
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deleteRequisitionById**
```swift
    open class func deleteRequisitionById(id: UUID, completion: @escaping (_ data: SuccessfulDeleteResponse?, _ error: Error?) -> Void)
```



Delete requisition and its end user agreement

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let id = 987 // UUID | A UUID string identifying this requisition.

RequisitionsAPI.deleteRequisitionById(id: id) { (response, error) in
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
 **id** | **UUID** | A UUID string identifying this requisition. | 

### Return type

[**SuccessfulDeleteResponse**](SuccessfulDeleteResponse.md)

### Authorization

[jwtAuth](../README.md#jwtAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **requisitionById**
```swift
    open class func requisitionById(id: UUID, completion: @escaping (_ data: Requisition?, _ error: Error?) -> Void)
```



Retrieve a requisition by ID

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let id = 987 // UUID | A UUID string identifying this requisition.

RequisitionsAPI.requisitionById(id: id) { (response, error) in
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
 **id** | **UUID** | A UUID string identifying this requisition. | 

### Return type

[**Requisition**](Requisition.md)

### Authorization

[jwtAuth](../README.md#jwtAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **retrieveAllRequisitions**
```swift
    open class func retrieveAllRequisitions(limit: Int? = nil, offset: Int? = nil, completion: @escaping (_ data: PaginatedRequisitionList?, _ error: Error?) -> Void)
```



Retrieve all requisitions belonging to the company

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let limit = 987 // Int | Number of results to return per page. (optional) (default to 100)
let offset = 987 // Int | The initial zero-based index from which to return the results. (optional) (default to 0)

RequisitionsAPI.retrieveAllRequisitions(limit: limit, offset: offset) { (response, error) in
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

[**PaginatedRequisitionList**](PaginatedRequisitionList.md)

### Authorization

[jwtAuth](../README.md#jwtAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

