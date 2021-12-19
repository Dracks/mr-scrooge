
const selectFilterByContents = (input, option)=> option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0

export {selectFilterByContents }