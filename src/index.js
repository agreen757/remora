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
  HStack,
  useColorMode,
} from "@chakra-ui/react";
import { Waveform } from "@uiball/loaders";
import { Image as IMG } from "@chakra-ui/react";
import { APIFY_TOKEN } from "./config";
//import Search from "./components/search";
import Search from "./components/search";
//import Locations from './components/locations'
import LocationsList from "./components/locations";
//import PostList from components/igposts
import PostList from "./components/igposts";
import theme from "./theme/theme";
//react router stuff
import {
  BrowserRouter,
  useNavigate,
  useHistory,
  useRouteMatch,
} from "react-router-dom";
import { BrowserHistory, Router, Route, Routes } from "react-router";
import { Link as RouteLink } from "react-router-dom";
import CreateCampaign from "./pages/create_campaign.js";
import Campaign from "./pages/campaign";
import CampaignList from "./pages/campaign_list";

function App() {
  const ApifyClient = require("apify-client");
  const { colorMode, toggleColorMode } = useColorMode();
  const [socket, setSocket] = React.useState(null);
  const [campaignRunningStatus, setCampaignRunningStatus] =
    React.useState(false);
  const [searching, setSearching] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");
  const [resultsValue, setResultsValue] = React.useState(5);
  const [locations, setLocations] = React.useState([]);
  const [campaignName, setCampaignName] = React.useState(null);
  const [campaignLocation, setCampaignLocation] = React.useState(null);
  const [selectedLocation, setSelectedLocation] = React.useState(null);
  const [selectedCampaign, setSelectedCampaign] = React.useState(null);
  const [posts, setPosts] = React.useState([]);
  const handleChange = (event) => setSearchValue(event.target.value);
  const handleResultsChange = (event) => setResultsValue(event.target.value);
  const handleCheckboxChange = (event) =>
    setSelectedLocation(event.target.value ? event.target.value : null);
  const handleCampaignName = (event) => {
    setCampaignName(event.target.value);
  };
  const navigate = useNavigate();

  const canvasRef = useRef();

  const apifyClient = new ApifyClient({
    token: APIFY_TOKEN,
  });

  const socketUrl = "ddj46x-36863.csb.app";

  useEffect(() => {
    if (colorMode === "light") {
      toggleColorMode();
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
  const stopCampaign = async () => {
    console.log("stopCampaign");
    let input = {
      reason: "stop_campaign",
      campaignName: campaignName,
    };
    setCampaignRunningStatus(false);

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
    const client = new ApifyClient({
      token: APIFY_TOKEN,
    });
    setSearching(true);
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

    //send socket message to server to start campaign
    //await socket.send(JSON.stringify(input));

    let response = await fetch("https://" + socketUrl + "/start", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });

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
  //create campaign in dataset
  const initCampaign = async (event) => {
    //write the campaign info to the remora-campaigns Dataset
    setSearching(true);

    let dsetid = "8sb4rKyopvdkVZE2o";
    let location_url = selectedLocation;
    console.log(location);
    let location_name = locations.filter((ele) => {
      if (ele.url === location) {
        return ele;
      }
    });
    console.log(campaignName);
    let input = {
      campaign_name: campaignName,
      location: location_url,
      created: new Date(),
    };

    let b = await apifyClient.datasets();
    let c = await apifyClient.keyValueStores();
    //push to the remora-campaigns dataset
    let dset = await b
      .getOrCreate("remora-campaigns")
      .then((dd) => {
        return apifyClient.dataset(dd.id);
      })
      .catch((err) => {
        console.log(err);
      });

    await dset.pushItems(input);
    console.log("updated remora-campaigns dataset");

    //create empty dataset for campaign to store posts
    let pdataset = await b.getOrCreate(campaignName).then(async (dd) => {
      //update key value store with campaign name and dataset id
      let kvstore = await c.getOrCreate(campaignName).then(async (kd) => {
        let update_items = [
          {
            key: "campaign_name",
            value: campaignName,
          },
          {
            key: "location_url",
            value: location_url,
          },
          {
            key: "location_name",
            value: location_name,
          },
          {
            key: "dataset_id",
            value: dd.id,
          },
          {
            key: "created",
            value: new Date(),
          },
        ];

        for (var i in update_items) {
          let item = update_items[i];

          await apifyClient.keyValueStore(kd.id).setRecord(item);
        }
      });
      console.log("created key value store");
    });

    setTimeout(function () {
      setSearching(false);

      //show button to go to campaign
      setSelectedLocation(null);
      setSelectedCampaign(input);
    }, 2000);
  };
  //go to campaign page
  const gotoCampaign = async (event) => {
    console.log("in here");
    navigate("/campaign/" + selectedCampaign.campaign_name);
  };

  const searchloc = async (event) => {
    let str = searchValue;
    let resultsnum = resultsValue;
    //get search

    //if str is greater than five charachters, perform search
    if (str.length > 5 && !searching) {
      //make input to update apify task
      const client = new ApifyClient({
        token: APIFY_TOKEN,
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
          totalRuns: 15,
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
            apifyProxyGroups: ["RESIDENTIAL"],
          },
        },
      };
      console.log(input);
      let run = await client.task("VhplsklxGahw7MqYX").update(input);
      console.log("updated task to find loc");
      /*let dsetid = 'wPXQ0J4fWAq9WDNSp';
      const { items } = await client
            .dataset(dsetid)
            .listItems();
      console.log(items);*/
      let location_dataset_id = await client
        .task("VhplsklxGahw7MqYX")
        .call()
        .then(async (run) => {
          var defaultDatasetId = run.defaultDatasetId;
          return defaultDatasetId;
        });
      let dataset_list = await apifyClient
        .dataset(location_dataset_id)
        .listItems();
      console.log(dataset_list);
      let items = dataset_list.items;

      for (let i = 0; i < items.length; i++) {
        let item = items[i];
        let img = await image_preloader(
          item.topPosts[0].image_versions2.candidates[0].url,
        );
        //if the image loads, set the image
        if (img) item.img = img;
        //remove the item from the list
        else items.splice(i, 1);
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

      let fakeobj = [
        {
          name: "Harbor Park",
        },
      ];

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
    <Container bg={"#0b8dc1"} h={"100vh"} maxW="8xl" pt={"10px"}>
      <Routes>
        <Route
          exact
          path="/"
          element={
            <CreateCampaign
              gotoCampaign={gotoCampaign}
              initCampaign={initCampaign}
              selectedCampaign={selectedCampaign}
              handleCampaignName={handleCampaignName}
              handleChange={handleChange}
              searching={searching}
              locations={locations}
              handleCheckboxChange={handleCheckboxChange}
              selectedLocation={selectedLocation}
              searchloc={searchloc}
              setCampaignName={setCampaignName}
              posts={posts}
            />
          }
        />
        <Route
          path="/campaign/:id"
          element={
            <Campaign
              campaignRunningStatus={campaignRunningStatus}
              setCampaignRunningStatus={setCampaignRunningStatus}
              setCampaignName={setCampaignName}
              startCampaign={startCampaign}
              stopCampaign={stopCampaign}
              setSocket={setSocket}
              socketUrl={socketUrl}
              setCampaignLocation={setCampaignLocation}
            />
          }
        />
        <Route path="/campaigns" element={<CampaignList />} />
      </Routes>
    </Container>
  );
}

const rootElement = document.getElementById("root");
const root = ReactDOMClient.createRoot(rootElement);

root.render(
  <BrowserRouter>
    <ChakraProvider>
      <App />
    </ChakraProvider>
  </BrowserRouter>,
);
