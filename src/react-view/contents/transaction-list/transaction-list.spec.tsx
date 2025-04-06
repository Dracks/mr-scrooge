import { queries, render, screen, waitFor } from "@testing-library/react";
import { setupServer,SetupServerApi } from "msw/node";
import React from "react";

import { ProvideApi } from "../../api/client";
import { BankTransaction, Label } from "../../api/models";
import { labelFactory } from "../../utils/data-factory/label.factory";
import { transactionFactory } from "../../utils/data-factory/transaction.factory";
import { http } from "../../utils/test/set-up-server";
import { ProvideLabelsData } from "../common/label.context";
import { ProvideTransactionsData } from "../common/transaction.context";
import { TransactionList } from "./transaction-list";

describe(`[${TransactionList.name}]`, ()=>{
    let server: SetupServerApi;
    
    
    beforeEach(() => {
        server = setupServer(http.get('/imports/parsers', ({response})=>response(200).json({
            parsers: [{
                fileNameRegex: "",
                name: "Test"
            }]
        })));
        server.listen();
    })
   
   afterEach(()=>{
       server.close()
   })
   
   const addLabels = (labels: Label[])=>{
       server.use(http.get('/labels', ({response})=>{
           return response(200).json({
               results: labels
           })
       }))
   }
   
   const addTransactions = (transactions: BankTransaction[])=>{
       server.use(http.get('/bank-transactions', ({response})=>{
           return response(200).json({
               results: transactions
           })
       }))
   }
   
   const renderList = () => {
       return render(
           <ProvideApi server="http://localhost">
                <ProvideLabelsData>
                    <ProvideTransactionsData>
                       <TransactionList />
                    </ProvideTransactionsData>
                </ProvideLabelsData>
           </ProvideApi>
       )
   }
   
   it('Renders correctly the list of transactions', async ()=>{
       const basicLabels = labelFactory.buildList(3)
       const transactions = [
           transactionFactory.build(),
           transactionFactory.build({
               labelIds: [basicLabels[0]?.id]
           })
       ]
       addLabels(basicLabels)
       addTransactions(transactions)
       
       
       renderList()
       const searchId = new RegExp('^transaction-row')
       await waitFor(()=>screen.findAllByTestId(searchId))
       expect(screen.getAllByTestId(searchId).length).toEqual(2)
       const rowWithLabel = screen.getByTestId(`transaction-row-${transactions[1]?.id ?? ''}`)
       const labelsAssigned = await queries.findAllByTestId(rowWithLabel, new RegExp('^selector-tag'))
       expect(labelsAssigned.length).toEqual(1)
       expect(labelsAssigned.at(0)?.textContent).toEqual(basicLabels[0]?.name)
       
   })
})