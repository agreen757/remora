import { Waveform } from "@uiball/loaders";
import { useRef, useEffect } from "react";
import * as React from "react";

import {
  Box,
  Input,
  Text,
  Stack,
  Container,
  Button,
  useColorModeValue,
  useColorMode,
} from "@chakra-ui/react";
import { useSearchParams, useParams } from "react-router-dom";
import PostList from "../components/igposts";
import HeaderBar from "../components/header";
import ReactPaginate from "react-paginate";
export default function Campaign(props) {
  let {
    socketUrl,
    socket,
    setSocket,
  } = props;
  const [queryParameters] = useSearchParams();
  const [posts, setPosts] = React.useState([]);
  const [open, setOpen] = React.useState(false);
  const [listening, setListening] = React.useState(false);
  const [pageNumber, setPageNumber] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(20);
  let { id } = useParams();
  const [initialized, setInitialized] = React.useState(false);
  const [noPosts, setNoPosts] = React.useState(false);
  const [campaignName, setCampaignName] = React.useState(null);
  const [campaignLocation, setCampaignLocation] = React.useState(null);
  const [campaignRunningStatus, setCampaignRunningStatus] = React.useState(false);

  //let socket = new WebSocket("wss://" + socketUrl);
  //remora-test-4
  
  function initSocket() {
    let socket = new WebSocket("wss://" + socketUrl)
    setSocket(socket);
    socket.onopen = async (event) => {
      console.log('opened socket');
      let data = event.data;
      let obj = {
        id: id,
        reason: "init",
      };

      await socket.send(JSON.stringify(obj));
      //set the socket and campaign name after establishing connection
      //setSocket(socket);
      //setCampaignName(id);
      //setOpen(true);
      setListening(true);
    };
    socket.onmessage = (event) => {
      let data = event.data;
      //console.log(data);
      let parsed = JSON.parse(data);
      console.log(parsed.reason);
      //results will have the location to inform the input to start the campaign

      if (parsed.reason === "fetch_initial_batch_response" && !initialized) {
        console.log("not init - setting loc and status");
        setCampaignLocation(
          parsed.location.value ? parsed.location.value : parsed.location,
        );
        //set the running status
        if (parsed.running === true) {
          setCampaignRunningStatus(true);
        }

        if (parsed.posts && parsed.posts.length > 0) {
          let pp = parsed.posts.filter((ele) => {
            if (ele.posts.length > 0) {
              return ele.posts;
            }
          });

          let mergedPosts = pp.reduce((accumulator, currentObject) => {
            return accumulator.concat(currentObject.posts);
          }, []);
          let k = posts;

          k.push.apply(k, mergedPosts);

          //remove duplicates
          k = k.filter((item, index) => {
            return (
              k.findIndex((item2) => {
                return item2.post.id === item.post.id;
              }) === index
            );
          });

          setPosts(k);
          setInitialized(true);
        }
      }

      if (parsed.reason === "campaign_posts_data") {
        console.log('in here')
        let name = parsed.campaignName;
        let p_data = [];
        console.log(parsed)
        if (name === id) {

          for (var i in parsed.posts) {
            let row = parsed.posts[i];

            if (row.posts && row.posts.length > 0) {
              for (var k in row.posts) {
                let p = row.posts[k];

                p_data.push(p);

              }
            }
          }
          setPosts(p_data);
        }

        //results will be posts from the campaign to fill posts
      }

      return true;
    };
    socket.onclose = (event) => {
      console.log("closed", event);
      console.log(listening)
      //reopen connection
      if (listening === true) {
        console.log('reopening socket')
        setOpen(false);
        setTimeout(initSocket, 1000);
      }
      
    };
  }
  function closeSocket () {
    setListening(false);
    socket.close();
  }

  //function fetchPosts will be called when the campaign is started
  //it will fetch the posts from the websocket server via post request and populate the posts array
  //post request to server will include the campaign name, page number, and number of posts to fetch
  async function fetchPosts() {
    //fetch posts from server

    return new Promise(async (resolve, reject) => {
      setCampaignName(id);
      let response = await fetch("https://" + socketUrl + "/fetch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          campaignName: id,
          pageNumber: pageNumber,
          pageSize: pageSize,
        }),
      });

      let parsed = await response.json();
      console.log(parsed)
      setCampaignLocation(
        parsed.location.value ? parsed.location.value : parsed.location,
      );
      //set the running status
      if (parsed.running === true) {
        setCampaignRunningStatus(true);
      }

      if (parsed.posts && parsed.posts.length > 0) {
        let pp = parsed.posts.filter((ele) => {
          if (ele.posts.length > 0) {
            return ele.posts;
          }
        });

        let mergedPosts = pp.reduce((accumulator, currentObject) => {
          return accumulator.concat(currentObject.posts);
        }, []);
        let k = posts;

        k.push.apply(k, mergedPosts);

        //remove duplicates
        k = k.filter((item, index) => {
            return (
              k.findIndex((item2) => {
                return item2.post.id === item.post.id;
              }) === index
            );
        });
        k.sort(function (a, b) {
          return new Date(b.post.time) - new Date(a.post.time);
        })
        setPosts(k);
      if (!initialized)
        setInitialized(true);
      } else {
        setNoPosts(true);
        setInitialized(true);
      }
    });


  }

  const stopCampaign = async () => {
    console.log("stopCampaign");
    let input = {
      reason: "stop_campaign",
      campaignName: campaignName,
    };
    setCampaignRunningStatus(false);
    closeSocket();
    let response = await fetch("https://" + socketUrl + "/stop", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });

    /*try {
      await socket.send(JSON.stringify(input));
    } catch (error) {
      console.log(error);
      let socket = new WebSocket(`wss://ddj46x-41965.csb.app/`);
      await socket.send(JSON.stringify(input));
    }*/
  };
  const startCampaign = async () => {
    //get selectedLocation
    //let location = selectedLocation;
    
    //setSearching(true);
    //create input for Apify task
    let input = {
      reason: "start_campaign",
      info: {
        resultsLimit: 200,
        resultsType: "posts",
        searchLimit: 2,
        extendOutputFunction: "",
        extendScraperFunction: "",
        customData: { campaignName: campaignName },
      },
      input: {
        directUrls: [campaignLocation],
        proxy: {
          useApifyProxy: true,
          apifyProxyGroups: ["RESIDENTIAL"],
        },
      },
    };

    let response = await fetch("https://" + socketUrl + "/start", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });
    setListening(true);
    setCampaignRunningStatus(true);

    /*let dsetid = 'GOTL6eBOUUfGKUlD6';
    const { items } = await client
            .dataset(dsetid)
            .listItems();*/

    /*let run = await client.actor("zmxouNS7LxOt2UPUD").call(input);
    const { items } = await client
            .dataset(run.defaultDatasetId)
            .listItems();
    console.log(items);
    setPosts(items[0].posts);
    setSearching(false);*/
  };


  //establish connection with websocket server
  //pull current campaign results if abvailable

  useEffect(() => {
    //look in the remora campaigns dataset to find

    console.log("in campaign use Effect");
    if (!initialized) {
      console.log("initial fetch");
      fetchPosts();
    }
  }, []);



  //pagination
  function PaginatedItems({ itemsPerPage }) {
    // Here we use item offsets; we could also use page offsets
    // following the API or data you're working with.

    // Simulate fetching items from another resources.
    // (This could be items from props; or items loaded in a local state
    // from an API endpoint with useEffect and useSt

    const [itemOffset, setItemOffset] = React.useState(0);

    const endOffset = itemOffset + itemsPerPage;
    console.log(`Loading items from ${itemOffset} to ${endOffset}`);
    const currentItems = posts.slice(itemOffset, endOffset);
    const pageCount = Math.ceil(posts.length / itemsPerPage);





    // Invoke when user click to request another page.
    const handlePageClick = (event) => {
      console.log(event)
      const newOffset = (event.selected * itemsPerPage) % posts.length;
      console.log(
        `User requested page number ${event.selected}, which is offset ${newOffset}`,
      );
      setItemOffset(newOffset);
      //setPageNumber(event.selected + 1);
      //fetchPosts();
    };
    useEffect(()=>{

    },[posts])
    //return as a React.memo() wrapped component

    return (
      <React.Fragment>
        <PostList posts={currentItems} />
        <ReactPaginate
          previousLabel={"← Previous"}
          nextLabel={"Next →"}
          pageCount={pageCount}
          onPageChange={handlePageClick}
          containerClassName={"pagination"}
          previousLinkClassName={"pagination__link"}
          nextLinkClassName={"pagination__link"}
          disabledClassName={"pagination__link--disabled"}
          activeClassName={"pagination__link--active"}
          breakLabel={"..."}
          breakClassName={"pagination__link"}
        />
      </React.Fragment>
    );
  }


  return (
    <Box>
      <Box
        padding={2}
        h={"300px"}
        borderRadius={"10px"}
        color="white"
        bg={"#0b8dc1"}
        pos={"relative"}
      >
        <HeaderBar name={id} />
        <Box mt={"20px"}>
          <Stack direction={'row'}>
          <Box>
            <Button
              onClick={campaignRunningStatus ? stopCampaign : startCampaign}
            >
              {campaignRunningStatus ? "Stop Campaign" : "Start Campaign"}
            </Button>
            </Box>
            <Box display={campaignRunningStatus ? 'block':'none'}>
              <Stack direction={'row'} gap={'10px'}>
                <Box>
                  <Button onClick={listening ? closeSocket:initSocket}>
                    {listening ? 'Stop Listening':'Listen'}
                  </Button>
                </Box>
                <Box pos={'relative'} display={listening ? 'block':'none'}>
                  <div style={{position:'absolute',bottom:'10px'}} className="circle red pulse"></div>
                </Box>
              </Stack>
            </Box>
          </Stack>
        </Box>
      </Box>
      <Box display={initialized ? "none" : "block"} pl={"50%"}>
        <Waveform color="white" size={50} />
      </Box>
      <Box padding={5} display={posts.length < 1 ? 'block':'none'}>
        <Text fontSize={'3xl'}>
          No Posts
        </Text>
      </Box>
      <Box padding={2}>
        <PaginatedItems itemsPerPage={20} />
      </Box>
    </Box>
  );
}
