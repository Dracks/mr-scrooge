import { Button, FormField, Select, TableCell, TableRow, TextInput } from "grommet"
import React from "react"
import { FilterConditional, TagFilter } from "../../../api/client/tag-filter/types"

interface FilterListRowArgs {
    filter: TagFilter,
    conditions: Array<{ key: FilterConditional, value: string }>
    reloadFilters: ()=>Promise<void>
}

export const FilterListRow: React.FC<FilterListRowArgs> = ({ filter, conditions, reloadFilters }) => {
    
    return <TableRow key={filter.id}>
        <TableCell>
            <Select
                options={conditions}
                id='select-condition-type'
                name='parent'
                value={filter.typeConditional}
                labelKey="value"
                valueKey={{ key: 'key', reduce: true }}
            />
        </TableCell>
        <TableCell>
            <TextInput id="text-input-name" name="name" value={filter.conditional} />
        </TableCell>
        <TableCell>
            <Button label="Delete" secondary />
        </TableCell>
    </TableRow>
}