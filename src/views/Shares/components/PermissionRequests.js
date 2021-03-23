import {useEffect,useState} from "react";
import {Button,Icon} from "semantic-ui-react";
import getShareObject from "../../../api/ShareObject/getShareObject";
import addSharedItem  from "../../../api/ShareObject/addSharedItem";
import {TableContainer} from "../../../components/table";
import PagedResponseDefault from "../../../components/defaults/PagedResponseDefault"


const PermissionRequest = ({share,client})=>{
    const [loading, setLoading]= useState(false);
    const [error, setError] = useState(null)
    const [sharedItems, setSharedItems] = useState(PagedResponseDefault );

    const fetchItems=async ()=>{
        setLoading(true);
        const response = await client.query(getShareObject ({
            shareUri:share.shareUri,
            filter:{
                isShared:false
            }
        }));
        if (!response.errors){
            setSharedItems({...response.data.getShareObject.items});
        }else {
            setError(``)
        }
        setLoading(false);
    }

    const addItemToShareObject=async (item)=>{
        setLoading(true);
        const response= await client.mutate(addSharedItem({
            shareUri:share.shareUri,
            input:{
                itemUri: item.itemUri,
                itemType: item.itemType
            }
        }))
        if (!response.errors){
            await fetchItems();
        }else {
            setError(`Could not add item, received ${response.errors[0].message}`);
            setLoading(false)
        }
    }

    useEffect(()=>{
        if (client){
            fetchItems();
        }
    },[client])
    return <TableContainer
        reload={fetchItems}
        columns={[{
            label:'itemUri',key:'itemUri',
        },
            {
                label:'Type', key:'itemType'
            },
            {
                label:'Name', key:'itemName'
            },

            {
                label:'Request ',key:'action'
            }
        ]}
        rows={sharedItems.nodes.map((item)=>{
            return {...item, action : <Button icon labelPosition='right' onClick={()=>{addItemToShareObject(item)}} size={`mini`}>
                    Request
                    <Icon name='plus' />
            </Button>}
        })}
    />

}


export default PermissionRequest;