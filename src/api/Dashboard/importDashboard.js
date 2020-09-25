import { gql } from "apollo-boost";

const importDashboard=({environmentUri ,input})=>{
    return {
        variables:{
            input  : input
        },
        mutation :gql`mutation importDashboard(
            $input:ImportDashboardInput,
        ){
            importDashboard(input:$input){
                dashboardUri
                name
                label
                DashboardId
                created
            }
        }`
    }
}


export default importDashboard;