//React component will show the returned locations

import React, { useState,useEffect } from "react";
import { Box, Button, Text, Image, Stack, Input,Checkbox,CheckboxGroup } from "@chakra-ui/react"

export default function LocationsList(props) {
    const locations = props.locations;
    const handleCheckboxChange = props.handleCheckboxChange;

    return (
        <Box pt={'10px'}>
        <Stack direction='row' spacing={3}>
          <CheckboxGroup>
            {/** Create Box for each location that has the background image and has inner text centered at the bottom of the Box */}
          {locations.map((item, index) => (
            <Box pos={'relative'} pl={2} borderRadius={'20px'} key={index} height="20px" bgRepeat={'none'} textAlign={'center'}>
              <Stack direction={'row'}>
                <Box pt={'5px'}>
                  <Checkbox value={item.url} onChange={handleCheckboxChange} />
                </Box>
                <Box textAlign={'left'} w={'200px'}>
                  <Text>{item.name}</Text>
                </Box>
              </Stack>
            </Box>
          ))}
          </CheckboxGroup>
        </Stack>
      </Box>
    )
}