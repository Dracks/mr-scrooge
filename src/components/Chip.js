import React from 'react';

const Chip = (props) => {
    let contents = []
    contents.push(props.name)

    return (
        <div class="chip">
            {contents}
        </div>
    )
}

export default Chip;