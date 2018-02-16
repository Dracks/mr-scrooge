import { connect } from 'react-redux';

import WithLoading from '../../network/LoadingHoc'

import Loading from '../../components/Loading'
import TableView from '../../components/TableView'
import { fetchRawData } from "./Actions";

const mapStateToProps = state=>{
    return {
        data:  state.showData
    }
}
const LoadingTableView = WithLoading(TableView, Loading, 'data', 'fetchRawData')
export default connect(mapStateToProps, {fetchRawData})(LoadingTableView)