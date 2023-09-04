/**
 * TDD
 *
 * Convert input to form with submit button
 *
 * Test
 *
 * Later you will have to decide how to display the results
 * and how to filter
 *
 *
 *
 */
import "./styles.css";
import * as React from "react";
import { useRef, useEffect } from "react";
import * as ReactDOMClient from "react-dom/client";
import {
  Box,
  ChakraProvider,
  Input,
  Text,
  Stack,
  Container,
  Button,
  useColorModeValue,
  useColorMode
} from "@chakra-ui/react";
import { Waveform } from "@uiball/loaders";
import {Image as IMG} from "@chakra-ui/react"
import { APIFY_TOKEN } from "./config";
 //import Search from "./components/search";
 import Search from './components/search'
 //import Locations from './components/locations'
import LocationsList from './components/locations'
//import PostList from components/igposts
import PostList from './components/igposts'
import theme from "./theme/theme";
function App() {
  const ApifyClient = require("apify-client");
  const { colorMode, toggleColorMode } = useColorMode();
  const [searching, setSearching] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");
  const [resultsValue, setResultsValue] = React.useState(5)
  const [locations, setLocations] = React.useState([])
  const [selectedLocation, setSelectedLocation] = React.useState(null)
  const [posts, setPosts] = React.useState([])
  const handleChange = (event) => setSearchValue(event.target.value);
  const handleResultsChange = (event) => setResultsValue(event.target.value);
  const handleCheckboxChange = (event) => setSelectedLocation(event.target.value ? event.target.value : null);
  const canvasRef = useRef();

 

  useEffect(() => {
    if (colorMode === 'light') {
      toggleColorMode()
    }
  }, []);

  const image_preloader = (src) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      //add cross origin same origin policy
      img.crossOrigin = "Anonymous";
      img.onload = () => resolve(img);
      //if an error occurs, return null
      img.onerror = () => resolve(null);
      img.src = src;
    });
  };
  const startCampaign = async (event) => {
    //get selectedLocation
    let location = selectedLocation;
    const client = new ApifyClient({
      token: APIFY_TOKEN
    });
    setSearching(true);
    //create input for Apify task
    let input = {
      input: {
        directUrls: [
          location
        ],
        resultsLimit: 200,
        resultsType: "posts",
        searchLimit: 2,
        extendOutputFunction: "",
        extendScraperFunction: "",
        customData: {},
        proxy: {
          useApifyProxy: true,
          apifyProxyGroups: ["RESIDENTIAL"]
        }
      }
    };
    /*let dsetid = 'GOTL6eBOUUfGKUlD6';
    const { items } = await client
            .dataset(dsetid)
            .listItems();*/

    let run = await client.actor("zmxouNS7LxOt2UPUD").call(input);
    const { items } = await client
            .dataset(run.defaultDatasetId)
            .listItems();
    console.log(items);
    setPosts(items[0].posts);
    setSearching(false);
    

        

  }




  const searchloc = async (event) => {
    let str = searchValue;
    let resultsnum = resultsValue;
    //get search

    //if str is greater than five charachters, perform search
    if (str.length > 5 && !searching) {
      //make input to update apify task
      const client = new ApifyClient({
        token: APIFY_TOKEN
      });

      setSearching(true);

      var input = {
        id: "ZxLNxrRaZrSjuhT9g",
        userId: "NcyiXxWFYmss6ZhEy",
        actId: "OtzYfK1ndEGdwWFKQ",
        createdAt: "2023-07-06T22:47:00.061Z",
        modifiedAt: "2023-07-07T00:09:52.779Z",
        removedAt: null,
        stats: {
          totalRuns: 15
        },
        input: {
          resultsLimit: parseInt(resultsnum),
          resultsType: "details",
          search: str,
          searchLimit: 2,
          searchType: "place",
          extendOutputFunction: "",
          extendScraperFunction: "",
          customData: {},
          proxy: {
            useApifyProxy: true,
            apifyProxyGroups: ["RESIDENTIAL"]
          }
        }
      };
      console.log(input);
      let run = await client.task("VhplsklxGahw7MqYX").update(input);
      console.log("updated task to find loc");
      let dsetid = '97fsaH1ifjUU5N46M'
      const { items } = await client
            .dataset(dsetid)
            .listItems();
      console.log(items);
      for (let i = 0; i < items.length; i++) {
        let item = items[i];
        let img = await image_preloader(item.topPosts[0].image_versions2.candidates[0].url);
        //if the image loads, set the image
        if (img)
          item.img = img;
        else
          //remove the item from the list
          items.splice(i, 1);
      }
  

      setLocations(items);
      setSearching(false);
      //removing temporarily
      /*await client
        .task("VhplsklxGahw7MqYX")
        .call()
        .then(async (run) => {
          var defaultDatasetId = run.defaultDatasetId;
          console.log(defaultDatasetId);
          const { items } = await client
            .dataset(run.defaultDatasetId)
            .listItems();
          console.log(items);
          //use the image preloader to get images for each location
          for (let i = 0; i < items.length; i++) {
            let item = items[i];
            let img = await image_preloader(item.topPosts[0].image_versions2.candidates[0].url);
            //if the image loads, set the image
            if (img)
              item.img = img;
            else
              //remove the item from the list
              items.splice(i, 1);
          }
      

          setLocations(items);

          //items will be in format

          setSearching(false);
        });*/
      //console.log(items);

      let fakeobj = [{
        name: "Harbor Park"
      }]

      //setLocations(fakeobj)
      /*await client.callTask("VhplsklxGahw7MqYX").then(async (run) => {
        console.log(run);
        var defaultDatasetId = run.defaultDatasetId;
        console.log(defaultDatasetId);
        let ndataset = await Dataset.open(defaultDatasetId);
        let ndatasetData = await ndataset.getData();
        console.log(ndatasetData);

        setSearching(false);
      });*/
    }
  };

  return (
    <Container bg={'#0b8dc1'} h={'100vh'} maxW='8xl' pt={'10px'}>
      <Box padding={2} h={'300px'} borderRadius={'10px'} color="white" bg={'#0b8dc1'} pos={'relative'}>
        {/** Create a stack for the header */}
        <Box id="bb" p={5}>
          <Search handleChange={handleChange} handleCheckboxChange={handleCheckboxChange} handleResultsChange={handleResultsChange} searchloc={searchloc} />
          <Box h={'45px'}>
            <Box display={searching ? "block" : "none"} pl={'50%'}>
              <Waveform color="white" size={50} />
            </Box>
          </Box>
          <LocationsList locations={locations} handleCheckboxChange={handleCheckboxChange} />
        </Box>
       {/** Box will display if selectedLocation has a value and it will contain the start button*/}
        <Box pl="20" pt={2} display={selectedLocation ? 'block' : 'none'}>
          <Button alignItems={'vertical'} pl={2} pt={2} onClick={() => { startCampaign() }}>Start Campaign?</Button>
        </Box>
        <Box display={posts ? "block" : "none"}>
          <PostList posts={posts} />
        </Box>
        {/*<Box height="400px" id="canvasDiv" ref={canvasRef}></Box>*/}
      </Box>
    </Container>
  );
}

const rootElement = document.getElementById("root");
const root = ReactDOMClient.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <ChakraProvider>
      <App />
    </ChakraProvider>
  </React.StrictMode>
);
