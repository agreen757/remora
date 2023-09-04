//React component will be the search input

import React, { useState,useEffect } from "react";
import { Box, Button, Text, Image, Stack, Input } from "@chakra-ui/react"

export default function Search(props) {
    const handleChange = props.handleChange;
    const handleResultsChange = props.handleResultsChange;
    const searchloc = props.searchloc;

    return (
        <Box p="20" height="140px">
        <Stack direction={'row'} spacing={3}>
          <Box>
          <Text>Search Location</Text>
          <Box>
            <Stack direction={'row'}>
              <Box>
              <Input
                id="search"
                border={'1px solid white'}
                input=""
                onChange={handleChange}
                placeholder="Search Location"
              />
              </Box>
              <Box>
              <Input
                  border={'1px solid white'}
                  id="results"
                  input=""
                  type="number"
                  onChange={handleResultsChange}
                  placeholder="#results"
                />
              </Box>
            </Stack>
          </Box>
          </Box>
          <Box pt={'23px'} >
            <Button
                border={'1px solid white'}
                onClick={() => {
                  searchloc();
                }}
              >
                Search
            </Button>
          </Box>
        </Stack>
      </Box>
    )

}