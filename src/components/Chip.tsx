import * as React from 'react';
import { eventHandler } from '../app/Utils';

const Chip = (props) => {
    let contents = []
    contents.push(props.name)
    if (props.onClick){
        contents.push(
            <i className="close material-icons" onClick={eventHandler(props.onClick)}>
                close
            </i>
        )
    }

    return (
        <div className="chip">
            {contents}
        </div>
    )
}

export default Chip;