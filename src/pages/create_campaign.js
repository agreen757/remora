import React, { useState, useEffect } from "react";
import { Waveform } from "@uiball/loaders";
import {
  Box,
  ChakraProvider,
  Input,
  Text,
  Stack,
  Container,
  Button,
  useColorModeValue,
  useColorMode,
} from "@chakra-ui/react"; //import Search from "./components/search";
import Search from "../components/search";
//import Locations from './components/locations'
import LocationsList from "../components/locations";
import HeaderBar from "../components/header";
import "../styles.css";
import theme from "../theme/theme";
export default function CreateCampaign(props) {
  let {
    handleChange,
    handleCampaignName,
    handleCheckboxChange,
    selectedCampaign,
    gotoCampaign,
    initCampaign,
    selectedLocation,
    searchloc,
    searching,
    locations,
    setCampaignName,
    handleResultsChange,
    posts,
  } = props;

  return (
    <>
      <HeaderBar name={"Create Campaign"} />
      <Box
        padding={2}
        h={"300px"}
        borderRadius={"10px"}
        color="white"
        bg={"#0b8dc1"}
        pos={"relative"}
      >
        {/** Create a stack for the header */}
        <Box id="bb">
          <Box mt={"20px"} maxW={"210px"}>
            <Input
              id="campaignName"
              border={"1px solid white"}
              input=""
              onChange={handleCampaignName}
              placeholder="Campaign Name"
            />
          </Box>
          <Search
            handleChange={handleChange}
            handleCheckboxChange={handleCheckboxChange}
            handleResultsChange={handleResultsChange}
            searchloc={searchloc}
            setCampaignName={setCampaignName}
          />
          <Box h={"45px"}>
            <Box display={searching ? "block" : "none"} pl={"50%"}>
              <Waveform color="white" size={50} />
            </Box>
          </Box>
          <LocationsList
            locations={locations}
            handleCheckboxChange={handleCheckboxChange}
          />
        </Box>
        {/** Box will display if selectedLocation has a value and it will contain the start button*/}
        <Box pt={"40px"}>
          <Box pt="20px" display={selectedLocation ? "block" : "none"}>
            <Button
              alignItems={"vertical"}
              pl={2}
              pt={2}
              onClick={() => {
                initCampaign();
              }}
            >
              Create Campaign
            </Button>
          </Box>
          <Box pt="20px" display={selectedCampaign ? "block" : "none"}>
            <Button
              alignItems={"vertical"}
              pl={2}
              pt={2}
              onClick={() => {
                gotoCampaign();
              }}
            >
              Go To Campaign
            </Button>
          </Box>
        </Box>
        {/*<Box height="400px" id="canvasDiv" ref={canvasRef}></Box>*/}
      </Box>
    </>
  );
}
