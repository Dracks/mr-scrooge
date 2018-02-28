import React, { Component } from 'react';

class MessageComponent extends Component{
    constructor(props) {
        super();
        this.setData = this.setData.bind(this);

        this.state = { show: false };
        this.previousTimer = null;
        props.register(this.setData);
    }

    setData(className, title, body, time) {
        this.setState({
            show: true,
            className: className,
            title: title,
            body: body
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
    render() {
        if (this.state.show) {
            const { className, title, body } = this.state;
            return (
            <div className={className}>
                <span className="card-title">{title}</span>
                <span className="body">{JSON.stringify(body)}</span>
            </div>
            )
        } else {
            return <div />
        }
    }
}

export default MessageComponent;