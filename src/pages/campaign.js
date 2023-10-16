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
    startCampaign,
    stopCampaign,
    setCampaignName,
    setCampaignLocation,
    campaignRunningStatus,
    setCampaignRunningStatus,
    socketUrl,
  } = props;
  const [queryParameters] = useSearchParams();
  const [posts, setPosts] = React.useState([]);
  const [open, setOpen] = React.useState(false);
  const [pageNumber, setPageNumber] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(20);
  let { id } = useParams();
  const [initialized, setInitialized] = React.useState(false);
  

  //let socket = new WebSocket("wss://" + socketUrl);
  //remora-test-4
  
  function initSocket() {
    let socket = new WebSocket("wss://" + socketUrl);
    socket.onopen = async (event) => {
      //console.log(data);
      let data = event.data;
      let obj = {
        id: id,
        reason: "fetch_initial_batch",
      };

      await socket.send(JSON.stringify(obj));
      //set the socket and campaign name after establishing connection
      //setSocket(socket);
      setCampaignName(id);
      setOpen(true);
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
        let name = parsed.campaignName;

        if (name === id) {
          let mergedPosts = parsed.posts.reduce(
            (accumulator, currentObject) => {
              return accumulator.concat(currentObject.posts);
            },
            [],
          );
          let k = posts;
          k.push.apply(k, mergedPosts);
          console.log(k);
          //sort by date;
          setPosts(k);
        }

        //results will be posts from the campaign to fill posts
      }

      return true;
    };
    socket.onclose = (event) => {
      console.log("closed", event);

      //reopen connection
      setOpen(false);
      setTimeout(initSocket, 1000);
    };
  }

  //function fetchPosts will be called when the campaign is started
  //it will fetch the posts from the websocket server via post request and populate the posts array
  //post request to server will include the campaign name, page number, and number of posts to fetch
  async function fetchPosts() {
    //fetch posts from server

    return new Promise(async (resolve, reject) => {

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
      if (!initialized)
        setInitialized(true);
      }
    });


  }


  //establish connection with websocket server
  //pull current campaign results if abvailable

  useEffect(() => {
    //look in the remora campaigns dataset to find

    console.log("in campaign use Effect");
    if (!initialized) {
      console.log("initial fetch");
      fetchPosts();
      //initSocket();




      //initSocket();
      /*socket.onopen = async (event) => {
        //console.log(data);
        let data = event.data;
        let obj = {
          id: id,
          reason: "fetch_initial_batch",
        };

        await socket.send(JSON.stringify(obj));
        //set the socket and campaign name after establishing connection
        //setSocket(socket);
        setCampaignName(id);
        setOpen(true);
      };
      socket.addEventListener("message", (data) => {
        console.log(data);
        let parsed = JSON.parse(data.data);
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
          let name = parsed.campaignName;

          if (name === id) {
            let mergedPosts = parsed.posts.reduce(
              (accumulator, currentObject) => {
                return accumulator.concat(currentObject.posts);
              },
              [],
            );
            let k = posts;
            k.push.apply(k, mergedPosts);
            console.log(k);
            //sort by date;
            setPosts(k);
          }

          //results will be posts from the campaign to fill posts
        }

        return true;
      });*/
      /* socket.onmessage = (event) => {
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
          let name = parsed.campaignName;

          if (name === id) {
            let mergedPosts = parsed.posts.reduce(
              (accumulator, currentObject) => {
                return accumulator.concat(currentObject.posts);
              },
              [],
            );
            let k = posts;
            k.push.apply(k, mergedPosts);
            console.log(k);
            //sort by date;
            setPosts(k);
          }

          //results will be posts from the campaign to fill posts
        }

        return true;
      };
      socket.onclose = (event) => {
        console.log("closed", event);

        //reopen connection
        setOpen(false);
      };*/
    }
  }, []);



  //pagination
  function PaginatedItems({ itemsPerPage }) {
    // Here we use item offsets; we could also use page offsets
    // following the API or data you're working with.

    // Simulate fetching items from another resources.
    // (This could be items from props; or items loaded in a local state
    // from an API endpoint with useEffect and useState)

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

    return (
      <>
        <PostList posts={currentItems} />
        <ReactPaginate
          breakLabel="..."
          nextLabel="next >"
          onPageChange={handlePageClick}
          pageRangeDisplayed={5}
          pageCount={pageCount}
          previousLabel="< previous"
          renderOnZeroPageCount={null}
          containerClassName="pagination"
          activeLinkClassName="activePostPage"
          disableInitialCallback={false}
        />
      </>
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
          <Button
            onClick={campaignRunningStatus ? stopCampaign : startCampaign}
          >
            {campaignRunningStatus ? "Stop Campaign" : "Start Campaign"}
          </Button>
        </Box>
      </Box>
      <Box display={initialized ? "none" : "block"} pl={"50%"}>
        <Waveform color="white" size={50} />
        </Box>
      <Box padding={2}>
        <PaginatedItems itemsPerPage={20} />
      </Box>
    </Box>
  );
}
