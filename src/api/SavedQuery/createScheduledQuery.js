import { gql } from "apollo-boost";

const createScheduledQuery=(input)=>{
    return {
        variables:{
            input  : input
        },
        mutation :gql`mutation CreateScheduledQuery(
            $input:NewScheduledQueryInput,
        ){
            createScheduledQuery(input:$input){
                scheduledQueryUri
                name
                label
                created
                description
                tags
            }
        }`
    }
}


export default createScheduledQuery;