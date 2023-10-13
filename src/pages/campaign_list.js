import {
    Box,
    Button,
    Stack,
    Text,
    Link,
    TableContainer,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    useDisclosure,
    ModalBody
  } from "@chakra-ui/react";

import { useRef, useEffect, useState } from "react";
import {CAMPAIGNS_DSET_ID, APIFY_TOKEN} from "../config"
import HeaderBar from '../components/header'

export default function CampaignList(props) {
    
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [campaigns, setCampaigns] = useState([]);
    const [selectedCampaign, setSelectedCampaign] = useState(null);
    const [socket, setSocket] = useState(null);
    const ApifyClient = require("apify-client");
    const apifyClient = new ApifyClient({
        token: APIFY_TOKEN
      });

    function get_campaign_list(){
        return new Promise ( async (resolve, reject) => {
            await apifyClient.dataset(CAMPAIGNS_DSET_ID).listItems().then((items)=>{
                console.log(items)
                resolve(items);
            }).catch((err)=>{
                console.log('list empty')
            });
        })
        
    }
    function remove_campaign_init(campaign) {
        //show modal to confirm
        onOpen();
        setSelectedCampaign(campaign.campaign_name);
    }
    async function remove_campaign() {

        //filter the campaign from the campaigns list and update the dataset 

        let cl = campaigns.filter((ele)=>{
            if (ele.campaign_name !== selectedCampaign) {
               
                return ele;
            }
        });

        await apifyClient.dataset(CAMPAIGNS_DSET_ID).delete().then(async (res)=>{
            console.log('creating dataset');

            //create dataset
            await apifyClient.datasets().getOrCreate('remora-campaigns').then(async (dataset)=>{
                //push data to dataset
                console.log('trying to push items')
                let dset = apifyClient.dataset(dataset.id);
                dset.pushItems(cl).then(()=>{
                    console.log('pushed successfuly')
                     setCampaigns(cl);
                    setSelectedCampaign(null);
                    onClose()
                }).catch((err)=>{
                    console.log('error on pushing items')
                    console.log(err)
                })
            }).catch((err) =>{
                console.log('caughterr',err)
            })
        })
       

    }
    
    useEffect(()=>{

        get_campaign_list().then((items)=>{
            setCampaigns(items.items);
        });

    },[]);

    return (
        <Box>
            <HeaderBar name={'Campaign List'} />
            <TableContainer>
                
                <Table>
                    <Thead>
                        <Tr>
                            <Th>Name</Th>
                            <Th>Location</Th>
                            <Th>Date Created</Th>
                            <Th></Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {campaigns.map((campaign)=>(
                            <Tr h={'80px'} key={campaign.campaign_name}>
                                <Td>
                                    <Link href={'/campaign/'+campaign.campaign_name}>{campaign.campaign_name}</Link>
                                </Td>
                                <Td>
                                    <Text>{campaign.location.split('/')[campaign.location.split('/').length - 1]}</Text>
                                </Td>
                                <Td>
                                    <Text>{campaign.created}</Text>
                                </Td>
                                <Td>
                                    <Stack direction="row">
                                        <Box>
                                            <Button onClick={function(event){remove_campaign_init(campaign)}} variant="outline">Delete</Button>
                                        </Box>
                                    </Stack>
                                </Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
            </TableContainer>
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>
                        <Stack direction={'row'}>
                        <Box>Remove Campaign</Box><Box><Text fontFamily={'Times New Roman serif'}>{selectedCampaign}?</Text></Box>
                        </Stack>
                    </ModalHeader>
                    <ModalBody>
                        <Button onClick={remove_campaign} variant={'outline'}>Confirm</Button>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </Box>
    )

}