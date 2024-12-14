import { Box, Nav, Sidebar, TextInput } from "grommet"
import React from 'react';
import { Route, Routes } from "react-router";

import { useApi } from '../../../api/client';
import { usePagination } from '../../../api/pagination';
import { useLogger } from '../../../utils/logger/logger.context';
import { AnchorLink } from '../../../utils/ui/anchor-link';
import { NewUser } from "./new-user";
import { UserSwitcher } from "./user-switcher";
import { UsersList } from './users-list';

export const AdminUsers: React.FC = ()=> {
    const [searchText, setSearchText] = React.useState<string>("")
    const logger = useLogger("AdminUsers")
    const client = useApi()
    const paginationUsers = usePagination(async next => {
        const { data } = await client.GET("/users", {params: {query: {cursor: next}}})
        if (data){
            return data
        } else {
            logger.error("Request didn't get data")
            throw Error("Get users didn't had any data")
        }
    }, {autostart: true, hash: (user)=> user.id})
    const users = paginationUsers.loadedData
    return <Box direction="row">
        <Sidebar background="neutral-2">
            <Nav>
                <Box pad="small">
                    <TextInput 
                    placeholder="Search user" 
                    value={searchText}
                    onChange={evt => {
                        setSearchText(evt.target.value)
                    }}
                    />
                </Box>
                <Box pad="small">
                    <AnchorLink to="">New</AnchorLink>
                </Box>
                <UsersList users={searchText.length >3 ? users.filter(user => user.email.includes(searchText) || user.username.includes(searchText)) : users} />
            </Nav>
        </Sidebar>
        <Box fill>
            <Routes>
                <Route path=":id" element={<UserSwitcher users={users} />} />
                <Route path="" element={<NewUser reload={()=>{paginationUsers.reset()} } />} />
            </Routes>
        </Box>
    </Box>
}