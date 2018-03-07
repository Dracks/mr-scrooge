
const eventHandler=(callback) => {
    return (e)=>{
        e.preventDefault();
        callback(e);
    }
}

const manageFedback=(promise, showMessage) => {
    
}

export { eventHandler };