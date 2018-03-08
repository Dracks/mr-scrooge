import { connect } from 'react-redux';

import TableView from '../../components/TableView'

const mapStateToProps = state=>{
    return {
        data:  state.showData.data
    }
}

export default connect(mapStateToProps)(TableView)