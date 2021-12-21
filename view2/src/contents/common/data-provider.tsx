import React from "react";
import { ProvideRdsData } from "./raw-data-source.context";
import { ProvideTagsData } from "./tag.context";

export const DataProvider : React.FC = ({children})=>
    <ProvideTagsData>
        <ProvideRdsData>{children}</ProvideRdsData>
    </ProvideTagsData>