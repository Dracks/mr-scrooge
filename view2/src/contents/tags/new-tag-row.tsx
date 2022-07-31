import { Button, Form, FormField, TableCell, TableRow, TextInput } from "grommet"
import React from "react"
import { Tag } from "../../api/client/tag/types"
import { usePostTags } from "../../api/client/tag/use-post-tags"

interface NewTagRowProps {
    close: (newTag?: Tag) => Promise<void> | void
}
export const NewTagRow: React.FC<NewTagRowProps> = ({close})=>{
    const [, useCreateTag] = usePostTags()
    const [name, setName] = React.useState("")

    return <TableRow>
        <TableCell>
            
        </TableCell>
        <TableCell>
            <TextInput value={name} onChange={event => setName(event.target.value)} placeholder='New tag name'/>
        </TableCell>
        <TableCell/>
        <TableCell/>
        <TableCell>
            <Button label="Save" onClick = {async ()=>{
                const response = await useCreateTag({
                    data: {
                        name
                    }
                })
                if (response.status === 201) {
                    await close(response.data)
                } else {
                    console.log(response.status, response.data)
                }
                
                }}/>
            <Button label="Cancel" onClick = {()=>close()}/>
        </TableCell>
        </TableRow>
        
}