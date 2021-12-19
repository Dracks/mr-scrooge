import * as React from 'react'; import { Component } from 'react';

class MessageComponent extends Component<any, any>{
    private previousTimer;
    constructor(props) {
        super(props);
        this.setData = this.setData.bind(this);

        this.state = { show: false };
        this.previousTimer = null;
        props.register(this.setData);
    }

    public setData(className, title, body, time) {
        this.setState({
            body,
            className,
            show: true,
            title,
        })
        if (this.previousTimer) {
            clearTimeout(this.previousTimer);
        }
        if (time) {
            setTimeout(() => {
                this.setState({
                    show: false
                });
            }, time * 1000)

        }
    }
    public render() {
        if (this.state.show) {
            const { className, title, body } = this.state;
            return (
            <div className={className}>
                <span className="card-title">{title}</span>
                <span className="body">{body}</span>
            </div>
            )
        } else {
            return <div />
        }
    }
}

export default MessageComponent;