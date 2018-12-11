import { Button, Form, Icon, Select, Upload} from 'antd';
import * as React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom'

import { restChain } from 'redux-api-rest-hocs';
import { Primary } from '../../components/dessign/buttons';
import Loading from '../../components/Loading';
import { getOptions } from '../../components/Select';
import ImportActions from "./Actions";

import addDispatch from 'src/utils/redux/AddDispatch';
import { eventHandler } from '../Utils';


/* tslint:disable object-literal-sort-keys */
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

/* tslint:enable */

const FormItem = Form.Item;
class WizardImportForm extends React.Component<any, any> {
    constructor(props){
        super(props);
        this.send = this.send.bind(this);
        this.state={fileList: null}
    }

    public sendFile(kind, file){
        const formData = new FormData();
        formData.append('kind', kind);
        formData.append('file', file, file.name);
        this.props.sendFile(formData, ( data)=>{
            this.props.history.push('/import/'+data.id);
        });
    }
    public send(){
        this.props.form.validateFields((err, values)=>{
            if (!err){
                this.sendFile(values.kind, this.state.fileList[0])
            }
        })
    }
    public render (){
        const listKinds = [{key:'', value:'Select'}].concat(this.props.acceptedKinds.map((e)=>({key:e, value:e})))
        const { getFieldDecorator } = this.props.form;

        const sfUploaProps = {
            beforeUpload: (file) => {
              this.setState({
                fileList: [file],
              });
              return false;
            },
            fileList: this.state.fileList,
            onRemove: () => {
              this.setState({fileList: []});
            },
          };

        return (
            <Form onSubmit={eventHandler(this.send)} >
                <h2 style={{textAlign:"center"}}>Import new data</h2>
                <FormItem
                    {...formItemLayout}
                    label="Select"
                    hasFeedback={true}
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
                            message: 'You need a file to import',
                            required: true,
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

const f = withRouter(Form.create()(WizardImportForm) as any)

const mapStateToProps = ({acceptedKinds}) => {
    return { acceptedKinds }
}

const mapDispatchToProps = addDispatch({
    fetchImportKinds: ImportActions.getKinds,
    sendFile: ImportActions.sendFile
});

const WizardImportLoading = restChain()
    .setProperty('acceptedKinds')
    .setInitialize('fetchImportKinds')
    .withLoading(Loading)
    .build(f) as any

export default connect( mapStateToProps, mapDispatchToProps)(WizardImportLoading);