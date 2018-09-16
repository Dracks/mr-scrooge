import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom'
import { Form, Button, Upload, Icon, Select} from 'antd';

import withLoading from '../../network/LoadingHoc';
import { getOptions } from '../../components/Select';
import Loading from '../../components/Loading';
import { Primary } from '../../components/dessign/buttons';

import { eventHandler } from '../Utils';

import { fetchImportKinds, sendFile } from "./Actions";

const formItemLayout = {
    labelCol: {
        xs: { span: 24 },
        sm: { span: 6 },
        md: { span: 8 },
        lg: { span: 9 },
        xl: { span: 10 },
    },
    wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
        md: { span: 12 },
        lg: { span: 8 },
        xl: { span: 6 }
    },
};

const tailFormItemLayout = {
    wrapperCol: {
      xs: {
        span: 24,
        offset: 0,
      },
      sm: {
        span: 16,
        offset: 6,
      },
      md: {
        span: 16,
        offset: 8,
      },
      lg: {
        span: 15,
        offset: 9,
      },
      xl: {
        span: 14,
        offset: 10,
      },
    },
  };

const FormItem = Form.Item;
class WizardImportForm extends React.Component {
    constructor(props){
        super(props);
        this.send = this.send.bind(this);
        this.state={fileList: null}
    }

    sendFile(kind, file){
        var formData = new FormData();
        formData.append('kind', kind);
        formData.append('file', file, file.name);
        this.props.sendFile(formData, ( data)=>{
            this.props.history.push('/import/'+data.id);
        });
    }
    send(){
        this.props.form.validateFields((err, values)=>{
            if (!err){
                this.sendFile(values.kind, this.state.fileList[0])
            }
        })
    }
    render (){
        const listKinds = [{key:'', value:'Select'}].concat(this.props.acceptedKinds.map((e)=>{return {key:e, value:e}}))
        const { getFieldDecorator } = this.props.form;

        const sfUploaProps = {
            onRemove: () => {
              this.setState({fileList: []});
            },
            beforeUpload: (file) => {
              this.setState({
                fileList: [file],
              });
              return false;
            },
            fileList: this.state.fileList,
          };

        return (
            <Form onSubmit={eventHandler(this.send)} >
                <h2 style={{textAlign:"center"}}>Import new data</h2>
                <FormItem
                    {...formItemLayout}
                    label="Select"
                    hasFeedback
                    >
                    {getFieldDecorator('kind', {
                        rules: [
                        { required: true, message: 'Format file is mandatory' },
                        ],
                    })(
                        <Select>
                            {getOptions(listKinds)}
                        </Select>
                    )}
                </FormItem>
                <FormItem
                    {...formItemLayout}
                    label="file"
                    >
                    {getFieldDecorator('file', {
                        rules: [ {
                        required: true, message: 'You need a file to import',
                        }],
                    })(
                        <Upload name="logo" 
                            listType="picture"
                            {...sfUploaProps}>
                            <Button>
                                <Icon type="upload" /> Click to upload
                            </Button>
                        </Upload>
                    )}
                </FormItem>
                <FormItem {...tailFormItemLayout}>
                    <Primary htmlType="submit">
                        Send
                    </Primary>
                </FormItem>
            </Form>
        )
    }
}

const f = Form.create()(WizardImportForm)

const mapStateToProps = ({acceptedKinds}) => {
    return { acceptedKinds }
}

const mapDispatchToProps = (dispatch) => {
    return { 
        sendFile:(data, callback)=>{dispatch(sendFile(data, callback))},
        fetchImportKinds: ()=>{dispatch(fetchImportKinds())},
    }
}
const WizardImportLoading = withLoading(withRouter(f), Loading, 'acceptedKinds', 'fetchImportKinds')
export default connect( mapStateToProps, mapDispatchToProps)(WizardImportLoading);