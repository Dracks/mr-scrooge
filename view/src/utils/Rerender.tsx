import React from 'react';

const RerenderDebug = (C: React.ComponentType<any>, name="")=>{
    class W extends React.PureComponent{
        private oldProps = {}
    
        public render(){
            const props = this.props;
            const oldProps = this.oldProps;
            const diff = Object.keys(props).map((k)=>{
                return {
                    diff: props[k] !== oldProps[k],
                    key: k,
                }
            }).filter((e)=>e.diff).map(e=>e.key)
            // tslint:disable-next-line:no-console
            console.log("Render:"+name+" Because: "+diff.join(","));
            this.oldProps = props;
            return <C {...props} />
        }
    }
    return W;
}


export default RerenderDebug