//React component will be the search input

import React, { useState, useEffect } from "react";
import { Box, Button, Text, Image, Stack, Input } from "@chakra-ui/react";

export default function Search(props) {
  const handleChange = props.handleChange;
  const handleResultsChange = props.handleResultsChange;
  const searchloc = props.searchloc;

  return (
    <Box pt="10" height="140px">
      <Stack direction={"row"} spacing={3}>
        <Box>
          <Text>Search Location</Text>
          <Box>
            <Stack direction={"row"}>
              <Box>
                <Input
                  id="search"
                  border={"1px solid white"}
                  input=""
                  onChange={handleChange}
                  placeholder="Search Location"
                />
              </Box>
            </Stack>
          </Box>
        </Box>
      </Stack>
      <Box pt={"13px"}>
        <Button
          size={"xs"}
          border={"1px solid white"}
          onClick={() => {
            searchloc();
          }}
        >
          Confirm
        </Button>
      </Box>
    </Box>
  );
}
