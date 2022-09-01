import { Button, TableCell, TableRow } from "grommet";
import React from 'react';

import { Tag } from "../../api/client/tag/types";
import { AnchorLink } from "../../utils/ui/anchor-link";

export const TagListRow : React.FC<{tag: Tag, tagHash: Record<number, Tag>}> = ({tag, tagHash})=>{
    const parentTag = tag.parent ? tagHash[tag.parent] : {name: undefined}
    return <TableRow>
        <TableCell>
            {parentTag.name}
        </TableCell>
        <TableCell>
            {tag.name}
        </TableCell>
        <TableCell>
            {tag.negateConditional ? "not and" : "or"}
        </TableCell>
        <TableCell>
            {tag.filters.length}
        </TableCell>
        <TableCell>
            <AnchorLink label="Edit" to={`${tag.id}`}/>
            <Button label="Delete" secondary/>
        </TableCell>
    </TableRow>

}