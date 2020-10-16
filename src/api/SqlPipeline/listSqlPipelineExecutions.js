import { gql } from "apollo-boost";

const listSqlPipelineExecutions= ({sqlPipelineUri, stage})=>{
    return {
        variables:{
            sqlPipelineUri:sqlPipelineUri,
            stage: stage
        },
        query:gql`
            query ListSqlPipelineExecutions($sqlPipelineUri:String!,$stage:String){
                listSqlPipelineExecutions(sqlPipelineUri:$sqlPipelineUri, stage:$stage){
                    count
                    page
                    pages
                    hasNext
                    hasPrevious
                    nodes{
                        executionArn
                        stateMachineArn
                        name
                        status
                        startDate
                        stopDate
                    }
                }
            }
        `
    }
}


export default listSqlPipelineExecutions ;