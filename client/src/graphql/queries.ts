import { gql } from '@apollo/client/core'

export const GET_PROCUREMENT_REQUESTS = gql`
  query GetProcurementRequests {
    procurementRequests {
      id
      title
      department
      priority
      status
      neededByDate
      items {
        id
        itemName
        quantity
        partNumber
        estimatedUnitCost
      }
      createdAt
    }
  }
`

export const CREATE_PROCUREMENT_REQUEST = gql`
  mutation CreateProcurementRequest($input: CreateProcurementRequestInput!) {
    createProcurementRequest(input: $input) {
      id
      title
      department
      priority
      status
      neededByDate
      createdAt
    }
  }
`

export const CREATE_REQUEST_ITEM = gql`
  mutation CreateRequestItem($input: CreateRequestItemInput!) {
    createRequestItem(input: $input) {
      id
      itemName
      quantity
      partNumber
      estimatedUnitCost
    }
  }
`

export const GET_PURCHASE_ORDERS = gql`
  query GetPurchaseOrders {
    purchaseOrders {
      id
      poNumber
      status
      orderDate
      expectedDeliveryDate
      subtotal
      notes
      procurementRequest {
        id
        title
      }
      vendor {
        id
        name
      }
      items {
        id
        itemName
        quantity
        unitOfMeasure
        unitCost
        lineTotal
        partNumber
        manufacturer
        quantityReceived
        quantityRemaining
        isFullyReceived
      }
      receipts {
        id
        quantityReceived
        receivedDate
        receivedBy
        notes
      }
      createdAt
    }
  }
`

export const CREATE_PURCHASE_ORDER = gql`
  mutation CreatePurchaseOrder($input: CreatePurchaseOrderInput!) {
    createPurchaseOrder(input: $input) {
      id
      poNumber
    }
  }
`

export const UPDATE_PO_STATUS = gql`
  mutation UpdatePurchaseOrderStatus($input: UpdatePurchaseOrderStatusInput!) {
    updatePurchaseOrderStatus(input: $input) {
      id
      status
    }
  }
`

export const GET_VENDORS = gql`
  query GetVendors {
    vendors {
      id
      name
      vendorType
      qualificationStatus
      isPreferred
      contactName
      email
      phone
      website
      industries
      specialties
      createdAt
    }
  }
`

export const CREATE_VENDOR = gql`
  mutation CreateVendor($input: CreateVendorInput!) {
    createVendor(input: $input) {
      id
      name
      vendorType
    }
  }
`

export const RECEIVE_PO_ITEM = gql`
  mutation ReceivePurchaseOrderItem($input: ReceivePurchaseOrderItemInput!) {
    receivePurchaseOrderItem(input: $input) {
      id
      status
    }
  }
`
