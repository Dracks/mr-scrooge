import { Button, Table, TableBody, TableCell, TableHeader, TableRow } from "grommet"
import { Add } from "grommet-icons"
import React from "react"
import { FilterConditional, TagFilter } from "../../../api/client/tag-filter/types"
import { FilterListRow } from "./filter-list-row"

interface FiltersTableListArgs {
    filters: TagFilter[],
    conditions: Record<FilterConditional, string>,
    reloadFilters: ()=>Promise<void>
}

export const FiltersTableList : React.FC<FiltersTableListArgs> = ({filters, conditions})=>{
    const [isAdding, setIsAdding] = React.useState(false)
    const conditionsList = Object.entries(conditions).map(([key, value]) => ({
        key: key as FilterConditional,
        value
    }))
    return <Table >
        <TableHeader>
            <TableRow>
                <TableCell scope="col" border="bottom">
                    type
                </TableCell>
                <TableCell scope="col" border="bottom" size='2/3'>
                    condition
                </TableCell>
                <TableCell>
                    Actions <Button icon={<Add size="small"/>} />
                </TableCell>
            </TableRow>
        </TableHeader>
        <TableBody>
            {isAdding ? "Adding" : undefined}
            {filters.map(filter =><FilterListRow key={filter.id} filter={filter} conditions={conditionsList}/>)}
        </TableBody>
    </Table>
}